
var socket = socket || window.socket;

Vue.component('chat-message', {
    props: ['id', 'type', 'author', 'body', 'date', 'emojis', 'reacts'],
    delimiters: ['[[', ']]'],
    data: function () {
        return {
            hover: false
        };
    },
    computed: {
        emojis: function () {
            return this.$props.emojis.reverse();
        },
        backgroundColor: function () {
            var type = this.$props.type;
            if (type === 'chat') {
                return '';
            }
            else if (type === 'q') {
                return '#d2f8d2';
            }
            return '';
        }
    },
    methods: {
        hasReacted: function (emoji) {
            var username = '{{ user.username }}';
            var reacts = this.$props.reacts;
            return emoji in reacts && reacts[emoji].reactors.includes(username);
        },
        onReact: function (emoji) {
            this.$emit('react', this.$props.id, emoji);
        }
    },
    template: '#chat-message-template'
});

var chatId = JSON.parse(document.getElementById('chat-id').textContent);

var chatApp = new Vue({
    el: '#chatapp',
    delimiters: ['[[', ']]'],
    data: {
        messages: [],
        users: [],
        message: '',
        updateType: '',
        view: window.location.hash.substr(1) || 'chat',
        prevShowNewPopup: false
    },
    methods: {
        fmtTooltip: function (reactors) {
            return reactors.join(', ');
        },
        changeTab: function (view) {
            this.view = view;
            this.updateType = 'change_tab';
        },
        popupClick: function () {
            this.prevShowNewPopup = false;
            var log = document.querySelector('#chat-log-{{chat_id}}');
            log.scrollTop = log.scrollHeight;
        },
        send: function () {
            var body = this.message;
            if (!body) {
                return;
            }
            if (this.view === 'pr') {
                body += ' #prayerrequest';
            }
            else if (this.view === 'q') {
                body += ' #q';
            }
            socket.send(JSON.stringify({
                'type': 'chat.message',
                'body': body
            }));
            this.message = '';
        }
    },
    computed: {
        numViewers: function () {
            return this.users.reduce(function (acc, x) {
                return acc + x.count;
            }, 0);
        },
        displaymessages: function () {
          if (this.view === 'chat') {
                return this.messages;
            }
            else if (this.view === 'pr') {
                return this.messages.filter(function (x) {
                    return x.tags.includes('pr');
                });
            }
            else if (this.view === 'q') {
                return this.messages.filter(function (x) {
                    return x.tags.includes('q');
                });
            }
            else if (this.view === 'viewers') {
                return [];
            }
            return this.messages;
        },
        showNewPopup: function () {
            if (this.updateType !== 'chat.message') {
                return this.prevShowNewPopup;
            }
            var log = document.querySelector('#chat-log-{{chat_id}}');

            if (log.scrollTop + 50 * 16 < log.scrollHeight) {
                this.prevShowNewPopup = true;
                return true;
            }
            this.prevShowNewPopup = false;
            return false;
        }
    },
    updated: function () {
        var t = this.updateType;
        if (t === 'chat.users_update') {
        }
        else if (t === 'chat.message' || t === 'chat.message_update') {
            var log = document.querySelector('#chat-log-{{chat_id}}');
            // a message is about 50 pixels
            if (log) {
                if (log.scrollTop + 50 * 16 < log.scrollHeight) {
                }
                else {
                    log.scrollTop = log.scrollHeight;
                }
            }
        }
        else if (t === 'chat.init' || t === 'change_tab') {
            var log = document.querySelector('#chat-log-{{chat_id}}');
            log.scrollTop = log.scrollHeight;
        }
        this.updateType = "";
    }
});


socket.register('chat', {
    onmessage: function (event) {
        chatApp.updateType = event.type;

        if (event.type == 'chat.users_update') {
            chatApp.users.splice(0, chatApp.users.length);
            for (var i = 0; i < event.users.length; ++i) {
                chatApp.users.push(event.users[i]);
            }
        }
        else {
            console.error('UNHANDLED MESSAGE TYPE ' + event.type);
        }
    },
    onopen: function () {
        socket.send(JSON.stringify({
            type: 'chat.connect',
            chat_id: chatId
        }))
    }
});
