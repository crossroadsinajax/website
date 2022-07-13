from datadog import DDClient, DDConfig

ddconfig = DDConfig(
    version_use_git=True,
    profiling_enabled=True,
)
ddclient = DDClient(config=ddconfig)

DatadogLogHandler = ddclient.LogHandler
