
var socket = socket || window.socket;

Vue.component('chat-message', {
    props: ['id', 'type', 'author', 'body', 'date', 'emojis', 'reacts'],
    delimiters: ['[[', ']]'],
    data: function () {
        return {
            hover: false
        };
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
        prevShowNewPopup: false
    },
    methods: {
        popupClick: function () {
            this.prevShowNewPopup = false;
            var log = document.querySelector('#chat-log-{{chat_id}}');
            log.scrollTop = log.scrollHeight;
        },
    },
    computed: {
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
