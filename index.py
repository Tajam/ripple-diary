from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit, rooms, join_room, leave_room
from random import randint
from awesomescraper import AwesomeScraper
from user import User
from room import Room
import json, datetime

app = Flask(__name__)
app.config['SECRET_KEY'] = 'nothingimportant'
socketio = SocketIO(app)

#Room supports
users, rooms = {},{}

fontawesome = None
if __name__ != '__main__':
    if AwesomeScraper.update():
        fontawesome = AwesomeScraper.get_result()
    else:
        print('Font support failed.')

def msg_parse(msg):
    temp = msg.split('::')
    indi = []
    for n in range(len(temp)-1):
        if n%2 == 0:
            indi.append('message')
            continue
        found = False
        for m in fontawesome:
            if temp[n] in fontawesome[m]:
                temp[n] = '<i class="'+m+' fa-'+temp[n]+'"></i>'
                indi.append('emoji')
                found = True
                break
        if not found: indi.append('message')
    return [temp,indi]
        
@socketio.on('connected')
def connected():
    users[request.sid] = User()
    print('Connection: {}'.format(request.sid))

@socketio.on('disconnect')
def disconnect():
    user = users.pop(request.sid,None)
    if user.room in rooms:
        rooms[user.room].users.remove(request.sid)
        if len(rooms[user.room].users) <= 0:
            rooms.pop(user.room, None)
    leave_room(user.room)
    emit('onlineupdate',len(users),room=user.room)
    print('Disconnected: {}'.format(request.sid))

@socketio.on('setname')
def setname(name):
    users[request.sid].name = name
    emit('setname', name)
    print('Set name {}: {}'.format(name,request.sid))
    
@socketio.on('createroom')
def createroom():
    room_id = Room.generate_hash(5)
    room = Room(room_id)
    room.host_id = request.sid
    rooms[room_id] = room
    rooms[room_id].users.append(request.sid)
    users[request.sid].room = room_id
    join_room(room_id)
    emit('createroom', room_id)
    print('Create room {}: {}'.format(room_id, request.sid))

@socketio.on('joinroom')
def joinroom(room_id):
    if not room_id in rooms:
        emit('joinroom', False)
        return
    rooms[room_id].users.append(request.sid)
    users[request.sid].room = room_id
    join_room(room_id)
    emit('joinroom', True)
    print('Join room {}: {}'.format(room_id, request.sid))

@socketio.on('leaveroom')
def leaveroom():
    room_id = users[request.sid].room
    rooms[room_id].users.pop(request.sid, None)
    users[request.sid].room = None
    leave_room(room_id)
    if len(rooms[room_id].users) <= 0:
        rooms.pop(room_id, None)
    emit('leaveroom', room_id)
    print('Leave room {}: {}'.format(room_id, request.sid))
    
@socketio.on('chatsend')
def chatsend(msg):
    #msg = msg_parse(msg)
    data = {
        'message':msg,
        'x':randint(10,90),
        'y':randint(10,80),
        'hash':hash(datetime.datetime.now())
        }
    room = users[request.sid].room
    emit('chatreceive',json.dumps(data), room=room)

@app.route('/')
def index():
    return render_template('base.html')

@app.route('/Debug')
def debug():
    return render_template('debug.html')

if __name__ == '__main__':
    print('Server served for debug...')
    socketio.run(app, host='0.0.0.0', port='20000')
