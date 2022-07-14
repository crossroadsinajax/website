from datadog import DDClient, DDConfig

ddconfig = DDConfig(
    version_use_git=True,
    profiling_enabled=True,
    tracing_enabled=True,
)
ddclient = DDClient(config=ddconfig)
ddclient.patch(["django", "psycopg", "sqlite3"])

DatadogLogHandler = ddclient.LogHandler
