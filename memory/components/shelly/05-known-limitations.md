# Shelly Known Limitations

## Relevant limitations

- Tight mJS heap.
- KVS persistence uncertainty across reboot.
- Timers and long-running loops can become fragile.
- HTTP.GET plus JSON.parse can be heavy.
- Too many simultaneous RPC calls can create failures.
- Virtual component support is useful but not equivalent to arbitrary cross-device virtual devices.

## Operational consequence

Design should favor:

- short scripts
- explicit contracts
- small objects
- simple sequencing
- clear ownership of each KVS key and component