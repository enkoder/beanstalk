# Logpush

Logpush is a Cloudflare product that delivers logs
to [various destinations](https://developers.cloudflare.com/logs/get-started/enable-destinations/). The destination
we are using here is
the [Worker Trace Event](https://developers.cloudflare.com/logs/reference/log-fields/account/workers_trace_events/).
Using this product, we can slurp up logs being produced from the Beanstalk API and ship them to where ever we'd like.
Cloudflare has a number of first
party [destinations](https://developers.cloudflare.com/logs/get-started/enable-destinations/), but
they don't have a first party [Grafana](https://grafana.com/) destination, so here we are.

## Grafana

You can find the Beanstalk's Grafana instance at https://netrunnerbeanstalk.grafana.net.

We ship our logs to grafana and can use them to gain insight into how the Beanstalk is holding up. We can get things
like RPS, percentage of success for ingestion, create alerts, and just generally dig into our logs to debug what is
going on. Classic o11y stuff.

## Secrets & Environment Variables

Move the [.dev.vars.example](./.dev.vars.example) file to .dev.vars and edit any secrets.

- LOKI_CREDENTIALS is a base64 encoded basic auth username:password. This can be found in the logs section of your
  grafana org account. Click on "My Account" at grafana.com after logging in.
- SHARED_TOKEN is just a string that is used to ensure it's the right Logpush data and keep out the riffraff
- SENTRY_DSN is not required for local development.

Be sure to update the Secrets in the CF dashboard after the worker has been deployed!

```shell
# from root of project
cd logpush
mv .dev.vars.example .dev.vars
```

## Testing & Development

Developing and testing this feature is pretty painful as you really don't have a good way to test against logpush.
During development, we can use a tunnel like Ngrok or Cloudflare Tunnels to create the Logpush Job and run real-world
tests while developing. It's not ideal for everyone, but very likely this project doesn't change much. Maybe we add
another destination at some point.

To create a Logpush Job we need to use their API since at the time of writing this, the dashboard can't create
`worker_trace_event` jobs.

```shell
# Install cloudflared (however you'd like)
brew install cloudflare/cloudflare/cloudflared

# Run a CF tunnel in a separate tunnel with
cloudflared tunnel --url http://localhost:8001

ACCOUNT_ID='Account ID can be found on the workers and pages section on dsahboard'
ACCOUNT_EMAIL='FILL ME IN'
SHARED_TOKEN='Something random, but save this'
API_TOKEN='You need Account Level Write Logs permission'
TUNNEL_URL='Set this from the output from cloudflared tunnel'

curl -XPOST "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/logpush/jobs" \
--header "Authorization: Bearer $API_TOKEN" \
--header "X-Auth-Email: $ACCOUNT_EMAIL" \
--header 'Content-Type: application/json' \
--data-raw '{
    "name": "beanstalk-logpush",
    "logpull_options": "fields=DispatchNamespace,Event,EventTimestampMs,EventType,Exceptions,Logs,Outcome,ScriptName,ScriptTags",
    "destination_conf": "$TUNNEL_URL?header_Authorization=$SHARED_TOKEN",
    "max_upload_bytes": 5000000,
    "max_upload_records": 1000,
    "dataset": "workers_trace_events",
    "frequency": "high",
    "enabled": true
}'
```
