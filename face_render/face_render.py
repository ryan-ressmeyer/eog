import vpython as vp
import serial
import time
from math import *
ser = serial.Serial('/dev/ttyUSB0', 9600, timeout = 3)
print(ser.name)
scene = vp.canvas()
scene.background = vp.color.gray(.2)
head_main = vp.ellipsoid(pos=vp.vector(0,.85,0), length = 1.3, width = 1.3, height=1.7, color=vp.vector(.9, .7, .5))
left_eye = vp.sphere(pos=vp.vector(-.25,1,.5), radius= .15, color = vp.vector(0,0,0))
right_eye = vp.sphere(pos=vp.vector(.25,1,.5), radius= .15, color = vp.vector(0,0,0))
head = vp.compound([head_main, left_eye, right_eye])
for i in range(5): 
    print(ser.readline())


old_theta = 0
old_phi = 0

while 1:
    read = ser.readline().decode("utf-8").split()
    x = float(read[1])
    y = float(read[3])
    z = float(read[5])
    theta = float(read[7])
    phi = float(read[9])
    print(f'x: {x} y: {y} z: {z} theta: {theta}, phi: {phi}')
    #mag = sqrt(x**2 + y**2 + z**2)
    #head.axis = vp.vector(x/mag, y/mag, z/mag)
    head.rotate(angle=-old_theta, axis=vp.vec(-1,0,0), origin=vp.vector(0,0,0))
    head.rotate(angle=theta, axis=vp.vec(-1,0,0), origin=vp.vector(0,0,0))

    head.rotate(angle=-old_phi, axis=vp.vec(0,0,1), origin=vp.vector(0,0,0))
    head.rotate(angle=phi, axis=vp.vec(0,0,1), origin=vp.vector(0,0,0))
    old_theta = theta
    old_phi = phi
