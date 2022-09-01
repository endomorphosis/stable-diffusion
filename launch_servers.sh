#!/bin/bash
#GET bash args
ARGS="$@"
WEBUI_ARGS=$ARGS
#get current directory
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
echo $DIR
NUM_GPUS=$(nvidia-smi --query-gpu=name --format=csv,noheader | wc -l)
#echo $NUM_GPUS
MIN_MEMORY=8000
DEFAULT_PORT=7860
SERVER_DATA_JSON="{"
PORTS_JSON="{"
ANNOUNCE_HOST="http://localhost:8000"
# loop $NUM_GPUS times 
for i in $(seq 1 $NUM_GPUS); do
    CUR_GPU=$(($i-1))
    #echo "GPU $CUR_GPU"
    GPU_MEMORY=$(nvidia-smi --query-gpu=memory.total --format=csv -i $CUR_GPU | grep -v "memory.total" | sed 's/[^0-9]*//g')
    GPU_MEMORY_USED=$(nvidia-smi --query-gpu=memory.used --format=csv -i $CUR_GPU | grep -v "memory.used" | sed 's/[^0-9]*//g')
    GPU_MEMORY_FREE=$(($GPU_MEMORY-$GPU_MEMORY_USED))
    GPU_MODEL=$(nvidia-smi --query-gpu=name --format=csv,noheader -i $CUR_GPU)
    CUR_PORT=$(($DEFAULT_PORT+$CUR_GPU))
    #echo "CUR_PORT: $CUR_PORT"
    #echo "GPU Memory: $GPU_MEMORY"
    #echo "GPU Memory Used: $GPU_MEMORY_USED"
    if [ $(($GPU_MEMORY_FREE)) -lt $(($MIN_MEMORY)) ]; then
        #echo "GPU Memory Free: $GPU_MEMORY_FREE"
        #echo "GPU Memory Free is less than $MIN_MEMORY"
        #echo "GPU $i is not available"
        continue
    else
        #echo "GPU Memory Free: $GPU_MEMORY_FREE"
        #echo "GPU Memory Free is greater than $MIN_MEMORY"
        #echo "GPU $i is available"
        #add port to ports_json
        PORTS_JSON="$PORTS_JSON\"$CUR_PORT\","
        SERVER_DATA_JSON="$SERVER_DATA_JSON{\"gpu_$CUR_GPU\": {\"port\": $CUR_PORT, \"memory\": $GPU_MEMORY, \"memory_used\": $GPU_MEMORY_USED, \"memory_free\": $GPU_MEMORY_FREE, \"GPU_MODEL\": $GPU_MODEL}}},"
        python -u webui.py $WEBUI_ARGS --realesrgan-dir=$DIR/src/realesrgan/ --share --gpu "$CUR_GPU" --port "$CUR_PORT" &
    fi
done
#remove last comma
SERVER_DATA_JSON=$(echo $SERVER_DATA_JSON | sed 's/.$//')
PORTS_JSON=$(echo $PORTS_JSON | sed 's/.$//')
PORTS_JSON="$PORTS_JSON}"
#echo $SERVER_DATA_JSON
IP_INTERFACES=$(ip -o -4 addr list | awk '{print $4}' | cut -d/ -f1)
#echo $IP_INTERFACES
IP_INTERFACES_JSON="{"
for i in $IP_INTERFACES; do
    #echo "IP: $i"
    IP_INTERFACES_JSON="$IP_INTERFACES_JSON \"$i\": {\"ports\": $PORTS_JSON},"
done
IP_INTERFACES_JSON=$(echo $IP_INTERFACES_JSON | sed 's/.$//')
IP_INTERFACES_JSON="$IP_INTERFACES_JSON}"
#echo $IP_INTERFACES_JSON
SERVER_REPORT_JSON="{\"server_data\": $SERVER_DATA_JSON, \"ip_interfaces\": $IP_INTERFACES_JSON}"
echo $SERVER_REPORT_JSON
#send json to announce host every 5 minutes
while true; do
    curl -X POST -H "Content-Type: application/json" -d "$SERVER_REPORT_JSON" $ANNOUNCE_HOST
    sleep 300
done