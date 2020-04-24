#!/bin/bash
for (( count=1; count<50; count++ ))
do
  curl http://localhost:3000 \
    -X POST \
    -H "Content-Type: application/json" \
    -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":83}' &
done
