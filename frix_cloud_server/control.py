from pexpect import popen_spawn
import pexpect, psutil, os, time, threading, uuid

class ProcessControl:
    def __init__(self, cmd: str, directory: str, spawn: bool = False):
        self.cmd: str = cmd
        self.directory: str = directory
        self.pid: int = None
        self.id = str(uuid.uuid4()).split('-')[0]
        if spawn == False:
            self.process = None 
            self.spawned: bool = False
            self.is_running: bool = False
        else:
            self.process = popen_spawn.PopenSpawn(self.cmd, cwd=os.path.abspath(self.directory), timeout=None, encoding=None)
            self.spawned: bool = True
            self.is_running: bool = True
            self.pid: int = self.process.pid
        self.logs_thread = threading.Thread(target=self.Logs, daemon=True)
        self.logs_thread.start()
        self.logs: list = []
    def Spawn(self):
        if not (self.Check_Process()):
            self.process = popen_spawn.PopenSpawn(self.cmd, cwd=os.path.abspath(self.directory), timeout=None, encoding=None)
            self.pid: int = self.process.pid
            self.spawned: bool = True
            self.is_running: bool = True
            return {'code': 200, 'status': 'Process Created'}
        return {'code': 505, 'status': 'Process already Running'}
    def Check_Process(self):
        if self.pid == None:
            return False
        try:
            status = psutil.pid_exists(int(self.pid))
            self.is_running: bool = status
            return status
        except: return False
    def Send_Command(self, command: str):
        if self.Check_Process():
            self.process.sendline(command)
            return {'code': 200, 'status': 'Successfully Sent the Command'}
        else:
            return {'code': 505, 'status': 'Process not Started'}
    def Power(self, command):
        try:
            if command == 'start':
                self.Spawn()
            elif command == 'stop':
                self.Send_Command('stop')
            elif ((command == 'restart') or (command == 'kill')) and (self.Check_Process()):
                proce = psutil.Process(self.pid)
                for proc in proce.children(recursive=True):
                    proc.kill()
                proce.kill()
                self.pid: bool = None
                self.is_running: bool = False
                if command == 'restart':
                    self.Spawn()
        except: pass
    def Logs(self):
        while True:
            try:
                logs = (self.process.read_nonblocking(size=1024, timeout=1))
                if logs.decode() == '': 
                    logs = (self.process.read_nonblocking(size=1024, timeout=0))
                if logs.decode() == '': continue
                splitted = logs.decode().split("\\r\\n")
                if len(splitted) == 1:
                    splitted = logs.decode().split("\\n")
                    if len(splitted) == 1:
                        splitted = logs.decode().split("\n")
                self.logs.extend(splitted)
            except AttributeError: pass
            except pexpect.EOF:
                self.pid = None
                self.is_running: bool = False
            time.sleep(0.5)
    def Status(self):
        server_on_or_off = ("Online" if self.Check_Process() else "Offline")
        server_stats = {
            'program': self.id,
            'type': 'resource',
            'code': 200,
            'status': server_on_or_off,
            'cpu_usages': round(sum([x for x in psutil.cpu_percent(percpu=True)])/psutil.cpu_count(), 2),
            'ram_percent': psutil.virtual_memory()[2],
            'ram_used': f"{round(psutil.virtual_memory().used/(1024*1024*1024), 2)} GB",
            'ram_max': f"{round(psutil.virtual_memory().total/(1024*1024*1024), 2)} GB"
        }
        return server_stats
