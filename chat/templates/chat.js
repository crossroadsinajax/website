
var socket = socket || window.socket;

String.prototype.hashCode = function () {
    var hash = 0;
    for (var i = 0; i < this.length; i++) {
        var character = this.charCodeAt(i);
        hash = ((hash << 5) - hash) + character;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
};

colours = [
    '#00ffff',
    '#000000',
    '#0000ff',
    '#a52a2a',
    '#00ffff',
    '#00008b',
    '#008b8b',
    '#006400',
    '#bdb76b',
    '#8b008b',
    '#556b2f',
    '#ff8c00',
    '#9932cc',
    '#8b0000',
    '#9400d3',
    '#008000',
    '#4b0082',
    '#808000',
    '#ffa500',
    '#ffc0cb',
    '#800080',
    '#800080',
    '#ff0000',
    '#ffff00'
];

Vue.component('chat-message', {
    props: ['id', 'type', 'author', 'body', 'date', 'emojis', 'reacts'],
    delimiters: ['[[', ']]'],
    data: function () {
        return {
            hover: false
        };
    },
    components: {
        'popper': VuePopper
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
            else if (type === 'pr') {
                return '#f6efe2';
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
        colour: function (str) {
            return colours[Math.abs(str.hashCode()) % (colours.length - 1)];
        },
        datefmt: function (sec) {
            var now = moment();
            var ts = moment.unix(sec);
            if (now.day() != ts.day()) {
                return ts.format('DD/MM/YY hh:mma');
            }
            return moment.unix(sec).format('hh:mma');
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
        toggleTag: function (id, tag) {
            socket.send(JSON.stringify({
                'type': 'chat.toggle_pr',
                'msg_id': id,
                'tag': tag
            }));
        },
        deleteMsg: function (id) {
            socket.send(JSON.stringify({
                'type': 'chat.message_delete',
                'msg_id': id
            }));
        },
        clearMsgs: function (id) {
            socket.send(JSON.stringify({
                'type': 'chat.message_clear_all',
                'msg_id': id
            }));
        },
        getType: function (msg) {
            if (msg.tags.includes('pr')) {
                return 'pr';
            }
            else if (msg.tags.includes('q')) {
                return 'q';
            }
            else {
                return 'chat';
            }
        },
        getReacts: function (msg) {
            return msg.reacts;
        },
        colour: function (str) {
            return colours[Math.abs(str.hashCode()) % (colours.length - 1)];
        },
        react: function (id, emoji) {
            socket.send(JSON.stringify({
                'type': 'chat.react',
                'msg_id': id,
                'react': emoji
            }));
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
