import json
from channels.generic.websocket import AsyncJsonWebsocketConsumer


class TestConsumer(AsyncJsonWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        self.username = ''
        super().__init__(*args, **kwargs)

    async def connect(self):
        self.game_id = self.scope['url_route']['kwargs']['game_id']
        # self.game_id = self.scope['path'].split('/')[-1]
        await self.channel_layer.group_add(self.game_id, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.game_id, self.channel_name)

    async def receive_json(self, content):
        command = content.get('command', None)
        try:
            if command == 'chat_message':
                await self.channel_layer.group_send(self.game_id, {
                    'type': 'chat_message',
                    'message': content['message'],
                    'username': self.username,
                })
            elif command == 'chat_join':
                self.username = content.get('username', None)
                await self.channel_layer.group_send(self.game_id, {
                    'type': 'chat_join',
                    'username': self.username
                })
            elif command == 'heartbeat':
                await self.channel_layer.group_send(self.game_id, {
                    'type': 'heartbeat',
                    'username': self.username
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

    async def chat_join(self, event):
        await self.send_json(
            {
                'type': 'chat_message',
                'message': '{0} joined'.format(event['username'])
            }
        )

    async def hearbeat(self, event):
        await self.send_json(
            {
                'type': 'heartbeat',
                'username': event['username']
            }
        )
