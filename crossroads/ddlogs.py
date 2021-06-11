import json
import logging
import os
import threading
from typing import List

import attr
import ddtrace
from ddtrace import tracer
from ddtrace.compat import httplib
from ddtrace.compat import get_connection_response
from ddtrace.internal.hostname import get_hostname
from ddtrace.internal.periodic import PeriodicService


logger = logging.getLogger(__name__)


@attr.s
class LogEvent(object):
    """
    Note: these attribute names match the corresponding entry in the JSON payload.
    """
    message = attr.ib(type=str)
    ddtags = attr.ib(type=str, default="")
    service = attr.ib(type=str, default=ddtrace.config.service)
    hostname = attr.ib(type=str, default=get_hostname())
    ddsource = attr.ib(type=str, default="python")


class JSONLogEncoder(object):
    content_type = "application/json"

    def encode(self, log):
        # type: (LogEvent) -> str
        return json.dumps(log.__dict__)

    def join_encoded(self, logs):
        # type: (List[str]) -> str
        return "[" + ",".join(logs) + "]"


class LogWriterV1(PeriodicService):
    """
    v1/input:
        - max payload size: 5MB
        - max single log: 1MB
        - max array size 1000

    refs:
        - https://docs.datadoghq.com/api/latest/logs/#send-logs
    """

    def __init__(self):
      # type: () -> None
      super().__init__(interval=1)
      self._lock = threading.Lock()
      self._buffer = []  # type: List[LogEvent]
      self._encoder = JSONLogEncoder()
      self._timeout = 2  # type: float
      self._api_key = os.environ.get("DD_API_KEY")
      assert self._api_key
      self._headers = {
          "DD-API-KEY": self._api_key,
          "Content-Type": self._encoder.content_type,
      }

    def enqueue(self, log):
        # type: (LogEvent) -> None
        with self._lock:
            self._buffer.append(log)

    def periodic(self):
        """
        TODO:
            - log limits
            - payload limits
        """
        if not self._buffer:
            return

        enc_logs = []
        for log in self._buffer:
            try:
                enc_log = self._encoder.encode(log)
            except TypeError:
                # TODO: possible infinite loop here? 🙀
                logger.error("Failed to encode log %r", log)
            else:
                enc_logs.append(enc_log)

        self._buffer = []
        payload = self._encoder.join_encoded(enc_logs)
        conn = httplib.HTTPSConnection("http-intake.logs.datadoghq.com", 443, timeout=self._timeout)
        try:
            conn.request("POST", "/v1/input", payload, self._headers)
            resp = get_connection_response(conn)
            if resp.status != 200:
                print(resp.status)
                print(resp.read())
        finally:
            conn.close()


writer = LogWriterV1()
writer.start()


class DDHandler(logging.StreamHandler):
    def __init__(self):
        super(DDHandler, self).__init__()

    def emit(self, record):
        span = tracer.current_span()
        span_id = str(span.span_id if span else 0)
        trace_id = str(span.trace_id if span else 0)
        msg = self.format(record)
        msg = msg.replace("_trace_id", trace_id)
        msg = msg.replace("_span_id", span_id)
        msg = msg.replace("_env", ddtrace.config.env)
        msg = msg.replace("_version", ddtrace.config.version)
        msg = msg.replace("_service", ddtrace.config.service)
        print(msg)
        event = LogEvent(message=msg)
        writer.enqueue(event)
