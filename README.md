# DIY Electronic table football
In this repository you will find everything you need to run your own electronic foosball table.

Here is a demo of the project in action: https://youtu.be/Jt9l0AatmII

There are 2 parts to this:

## Arduino setup
My setup uses photo-resisors in combination with LEDs. When the ball causes a dip in light the arduino will count that as a goal. 
![Arduino setup](https://i.imgur.com/mTtWblP.png)
The code can be found [here](https://github.com/s6joui/electronic-table-football/tree/master/goalcontroller).

## Web app
The second part is a web server written in python that runs ons an SBC. This serves a static page and also a web-socket server. The server reads the info coming from the arduino through the serial port and spits it to the webapp via websockets.
The code can be found [here](https://github.com/s6joui/electronic-table-football/tree/master/webapp)
