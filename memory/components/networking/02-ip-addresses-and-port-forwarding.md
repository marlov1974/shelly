# IP Addresses and Port Forwarding

## Known FTX IP pattern

Common FTX device addresses:

```text
192.168.77.10  supply fan
192.168.77.11  extract fan
192.168.77.12  heat
192.168.77.13  cool
192.168.77.20  supply UNI
192.168.77.21  extract UNI
192.168.77.22  process UNI
192.168.77.30  dampers
192.168.77.40  VVX
```

## External diagnostic pattern

A previous external proxy pattern used:

```text
192.168.86.240:80xx
```

where `xx` corresponds to the internal device IP last octet.

## Rule

When giving diagnostic URLs to the user, provide the full URL explicitly because building URLs manually on phone is cumbersome.