import websockets
import asyncio
import json
import argparse
parser = argparse.ArgumentParser()
#get first argument
parser.add_argument("announce", help="json data")
#assign the first argument to a variable
args = parser.parse_args()

json_file = args.announce
if __name__ == '__main__':
    

    pass
# open a json_file and return a dict
def open_json(json_file):
    with open(json_file) as f:
        return json.load(f)

