#! /usr/bin/python
import serial
import time
import os.path
import tornado.httpserver
import tornado.websocket
import tornado.ioloop
import tornado.web
from tornado import gen
import subprocess
import shlex

PORT = 80
clients = []

def send_to_all_clients(message):
  for client in clients:
    client.write_message(message)

def shutdown_system():
  cmd = shlex.split("sudo shutdown -h now")
  subprocess.call(cmd)
  
class WSHandler(tornado.websocket.WebSocketHandler):
  def open(self):
    clients.append(self)
    print ('[WS] Connection was opened.')
	
  def on_message(self, message):
    print ('[WS] Incoming message:'), message
    if message == "reset":
      game.reset()
    elif message == "shutdown":
      shutdown_system()

  def on_close(self):
    clients.remove(self)
    print ('[WS] Connection was closed.')


class Event:
  def __init__(self, type, content):
    self.type = type
    self.content = content

root = os.path.dirname(__file__) + "/www"
	
application = tornado.web.Application([
  (r'/ws', WSHandler),
  (r"/(.*)", tornado.web.StaticFileHandler, {"path": root, "default_filename": "index.html"})
])

class Game:
  score1 = 0
  score2 = 0
  goal = serial.Serial('/dev/ttyUSB0', 9600, timeout = 5)
  
  @gen.coroutine
  def game_loop(self):
    print ("Starting new game...")
    while self.score1 < 9 and self.score2 < 9:
      data = self.goal.readline()
      if len(data) > 0:
        if "1" in data:
          self.score1 += 1
        if "2" in data:
          self.score2 += 1
      e = Event("SCORE", "%s,%s" % (self.score1,self.score2))
      self.send_event(e)
      yield gen.sleep(0.5)
    self.send_event(Event("FINISH",""))
    self.score1 = 0
    self.score2 = 0
    print ("Sleeping...")
    yield gen.sleep(3)
    self.game_loop()

  def send_event(self, event):
    content = "{\"type\":\"%s\", \"content\":\"%s\"}" % (event.type, event.content)
    send_to_all_clients(content)
	  
  def reset(self):
    self.score1 = 0
    self.score2 = 0
    self.send_event(Event("SCORE", "%s,%s" % (self.score1,self.score2)))
	
game = Game()
	  
if __name__ == "__main__":
  try:
    http_server = tornado.httpserver.HTTPServer(application)
    http_server.listen(PORT)
    loop = tornado.ioloop.IOLoop.instance()
			
    print ("Tornado Server started")
    loop.spawn_callback(game.game_loop)
    loop.start()
  except:
    print ("Exception triggered - Tornado Server stopped.")