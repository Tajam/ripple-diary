import random

class Room():
    def __init__(self, room_id):
        self.room_id = room_id
        self.host_id = None
        self.users = []
        self.options = {
                'ripple_time' : 3,
                'cooldown' : 0,
                'send_image' : True,
                'show_id' : False,
                'dark_mode' : False
            }
    
    @staticmethod
    def generate_hash(length):
        h = ''
        for _ in range(length):
            d = chr(random.randint(48,57))
            u = chr(random.randint(65,90))
            l = chr(random.randint(97,122))
            h += random.choice([d,u,l])
        return h

if __name__ == '__main__':
    print(Room.generate_hash(5))
