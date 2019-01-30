from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit, rooms, join_room, leave_room
from random import randint
import json

app = Flask(__name__)
app.config['SECRET_KEY'] = 'tajamking4ever'
socketio = SocketIO(app)

users = dict()
rooms = dict()

@socketio.on('connected')
def connected():
    print('Connection:',request.sid)
    users[request.sid] = ''
    emit('onlineupdate',len(users),broadcast=True)

@socketio.on('disconnect')
def disconnect():
    print('Disconnected:',request.sid)
    users.pop(request.sid,None)
        
@socketio.on('chatsend')
def chatsend(msg):
    data = {'message':msg,'x':randint(10,90),'y':randint(10,80)}
    emit('chatreceive',json.dumps(data),broadcast=True)

@app.route('/')
def chain_reaction():
    return render_template('index.html')

if __name__ == '__main__':
    print('Socket server started!')
    socketio.run(app, host='0.0.0.0', port='20000')
