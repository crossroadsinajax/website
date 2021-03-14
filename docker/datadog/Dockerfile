FROM datadog/agent:7.26.0

COPY ./dd-entrypoint.sh /usr/local/bin
ENTRYPOINT ["/usr/local/bin/dd-entrypoint.sh"]
CMD ["/init"]
