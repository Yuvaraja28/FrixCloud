import asyncio, json, control, os
from websockets.server import serve

with open('programs.txt') as process:
    server_instance = [control.ProcessControl(x.replace('\n', ''), os.getcwd(), spawn=False) for x in process.readlines() if x != '\n']

class BackendServer:
    def __init__(self):
        self.clients: list = []
        self.process_list: dict = {x.id: x for x in server_instance}
        self.current_process = list(self.process_list)[0]
    async def SendResources(self, websocket):
        while (websocket in self.clients):
            try:
                await websocket.send(json.dumps(self.process_list.get(self.current_process).Status()))
                await asyncio.sleep(1)
            except: break
    async def SendLogs(self, websocket):
        while True:
            try:
                await websocket.send(json.dumps({'program': self.current_process, 'type': 'console_logs', 'logs': self.process_list.get(self.current_process).logs}))
                await asyncio.sleep(1)
            except: break
    async def ClientHandler(self, websocket, path):
        self.clients.append(websocket)
        print(f"Connected [{path[1:]}] [{websocket.remote_address[0]}:{websocket.remote_address[1]}]")
        asyncio.create_task(self.SendLogs(websocket))
        asyncio.create_task(self.SendResources(websocket))
        try:
            async for data in websocket:
                data = json.loads(data)
                if data.get('type') == 'list':
                    await websocket.send(json.dumps({'program': self.current_process, 'type': 'list', 'programs': [x for x in self.process_list]}))
                elif data.get('type') == 'console_command':
                    self.process_list.get(self.current_process).Send_Command(data.get('command'))
                elif data.get('type') == 'power':
                    self.process_list.get(self.current_process).Power(data.get('command'))
                elif data.get('type') == 'change_program':
                    self.current_process = data.get('program')
                else:
                    print(f"[{websocket.remote_address[0]}:{websocket.remote_address[1]}] sends {json.loads(data)} from {path[1:]}")
        except:
            print(f"Disconnected [{path[1:]}] [{websocket.remote_address[0]}:{websocket.remote_address[1]}]")
            self.clients.remove(websocket)
    async def Server(self):
        async with serve(self.ClientHandler, "0.0.0.0", 8000):
            await asyncio.Future()

if __name__ == '__main__':
    print("BackEnd Server")
    print("Waiting for the Connections")
    asyncio.run(BackendServer().Server())
