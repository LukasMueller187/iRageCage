import json
from channels.generic.websocket import AsyncJsonWebsocketConsumer


class TestConsumer(AsyncJsonWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        self.username = ''
        self.users = []
        self.whose_turn = ''
        super().__init__(*args, **kwargs)

    async def connect(self):
        self.game_id = self.scope['url_route']['kwargs']['game_id']
        await self.channel_layer.group_add(self.game_id, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_send(self.game_id, {
            'type': 'leave',
            'username': self.username,
        })
        await self.channel_layer.group_discard(self.game_id, self.channel_name)

    async def receive_json(self, content):
        command = content.get('command', None)
        print(content)
        try:
            if command == 'chat_message':
                await self.channel_layer.group_send(self.game_id, {
                    'type': 'chat_message',
                    'message': content['message'],
                    'username': self.username,
                })
            elif command == 'join':
                if not self.username:
                    self.username = content['username']
                await self.channel_layer.group_send(self.game_id, {
                    'type': 'join',
                    'username': self.username
                })
            elif command == 'whose_turn':
                await self.channel_layer.group_send(self.game_id, {
                    'type': 'whose_turn',
                    'username': content.get('username', None),
                })
            elif command == 'userlist':
                if 'users' in content.keys():
                    await self.channel_layer.group_send(self.game_id, {
                        'type': 'userlist',
                        'users': content['users'],
                    })
                else:
                    await self.channel_layer.group_send(self.game_id, {
                        'type': 'userlist',
                    })

        except ValueError as error:
            await self.send_json({'error': error})

    async def chat_message(self, event):
        message = event['message']
        username = event['username']
        await self.send_json(
            {
                'type': 'chat_message',
                'message': '{0}: {1}'.format(username, message)
            }
        )

    async def join(self, event):
        await self.send_json(
            {
                'type': 'join',
                'username': event['username'],
            }
        )
        await self.send_json(
            {
                'type': 'chat_message',
                'message': '{0} joined'.format(event['username'])
            }
        )

    async def leave(self, event):
        await self.send_json(
            {
                'type': 'leave',
                'username': event['username'],
            }
        )
        await self.send_json(
            {
                'type': 'chat_message',
                'message': '{0} left'.format(event['username'])
            }
        )

    async def whose_turn(self, event):
        if event['username']:
            await self.send_json(
                {
                    'type': 'whose_turn',
                    'username': event['username']
                }
            )
            await self.send_json(
                {
                    'type': 'chat_message',
                    'message': 'It\'s {0}s turn '.format(event['username'])
                }
            )
        else:
            await self.send_json(
                {
                    'type': 'whose_turn',
                }
            )

    async def userlist(self, event):
        if 'users' in event.keys():
            await self.send_json(
                {
                    'type': 'userlist',
                    'users': event['users'],
                }
            )
        else:
            await self.send_json(
                {
                    'type': 'userlist',
                }
            )
