import json
from channels.generic.websocket import AsyncJsonWebsocketConsumer


class TestConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.game_id = self.scope['url_route']['kwargs']['game_id']
        # self.game_id = self.scope['path'].split('/')[-1]
        await self.channel_layer.group_add(self.game_id, self.channel_name)
        await self.accept()
        await self.channel_layer.group_send(self.game_id, {
            'type': 'chat_join',
        })

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.game_id, self.channel_name)

    async def receive_json(self, content):
        command = content.get('command', None)
        try:
            if command == 'chat_message':
                await self.channel_layer.group_send(self.game_id, {
                    'type': 'chat_message',
                    'message': content['message'],
                })
        except ValueError as error:
            await self.send_json({'error': error})

    async def chat_message(self, event):
        message = event['message']
        await self.send_json(
            {
                'message': message
            }
        )

    async def chat_join(self, event):
        await self.send_json(
            {
                'message': 'joined'
            }
        )
