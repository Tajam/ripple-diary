from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit, rooms, join_room, leave_room
from random import randint
import json

app = Flask(__name__)
app.config['SECRET_KEY'] = 'hello'
socketio = SocketIO(app)

users = dict()
rooms = dict()

fontawesome = {'fas':list(),'fab':list()}
types = {'fas':'solid','fab':'brands'}
for n in types:
    file = open(types[n]+'.fal','r')
    fontawesome[n] = file.read().split(' ')
    print('Readed',len(fontawesome[n]),types[n],'fonts...')
    file.close()

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
    print('Connection:',request.sid)
    users[request.sid] = ''
    emit('onlineupdate',len(users),broadcast=True)

@socketio.on('disconnect')
def disconnect():
    print('Disconnected:',request.sid)
    users.pop(request.sid,None)
    emit('onlineupdate',len(users),broadcast=True)
        
@socketio.on('chatsend')
def chatsend(msg):
    msg = msg_parse(msg)
    data = {'message':msg,
            'x':randint(10,90),
            'y':randint(10,80)}
    emit('chatreceive',json.dumps(data),broadcast=True)

@app.route('/')
def chain_reaction():
    return render_template('index.html')

if __name__ == '__main__':
    print('Socket server started!')
    socketio.run(app, host='0.0.0.0', port='20000')
