// run.js
//================= { MODULE } =================\\
require('./tmp/helpers/commandMenu');
require('../settings/config');
const {
    smsg,
    getGroupAdmins,
    formatp,
    tanggal,
    formatDate,
    getTime,
    isUrl,
    await,
    sleep,
    clockString,
    msToDate,
    sort,
    toNumber,
    enumGetKey,
    runtime,
    fetchJson,
    getBuffer,
    jsonformat,
    delay,
    format,
    logic,
    generateProfilePicture,
    parseMention,
    getRandom,
    pickRandom,
    reSize
} = require('./lib/myfunction');

//================= { PREMIUM MODULE } =================\\
const {
    addPremiumUser,
    getPremiumExpired,
    getPremiumPosition,
    expiredCheck,
    checkPremiumUser,
    getAllPremiumUser
} = require('./lib/premium');

//================= { BAILEYS MODULE } =================\\
const {
    makeWASocket,
    downloadContentFromMessage,
    emitGroupParticipantsUpdate,
    emitGroupUpdate,
    generateWAMessageContent,
    generateWAMessage,
    makeInMemoryStore,
    prepareWAMessageMedia,
    generateWAMessageFromContent,
    MediaType,
    areJidsSameUser,
    WAMessageStatus,
    downloadAndSaveMediaMessage,
    AuthenticationState,
    GroupMetadata,
    initInMemoryKeyStore,
    getContentType,
    MiscMessageGenerationOptions,
    useSingleFileAuthState,
    BufferJSON,
    WAMessageProto,
    MessageOptions,
    WAFlag,
    WANode,
    WAMetric,
    ChatModification,
    MessageTypeProto,
    WALocationMessage,
    ReFastbyteectMode,
    WAContextInfo,
    proto,
    WAGroupMetadata,
    ProxyAgent,
    waChatKey,
    MimetypeMap,
    MediaPathMap,
    WAContactMessage,
    WAContactsArrayMessage,
    WAGroupInviteMessage,
    WATextMessage,
    WAMessageContent,
    WAMessage,
    BaileysError,
    WA_MESSAGE_STATUS_TYPE,
    MediaConnInfo,
    URL_REGEX,
    WAUrlInfo,
    WA_DEFAULT_EPHEMERAL,
    WAMediaUpload,
    mentionedJid,
    processTime,
    Browser,
    MessageType,
    Presence,
    WA_MESSAGE_STUB_TYPES,
    Mimetype,
    relayWAMessage,
    Browsers,
    GroupSettingChange,
    DisFastbyteectReason,
    WASocket,
    getStream,
    WAProto,
    isBaileys,
    AnyMessageContent,
    fetchLatestBaileysVersion,
    useMultiFileAuthState,
    templateMessage
} = require('baileys-pro');

//================= { MODULE } =================\\
const axios = require('axios');
const os = require('os');
const fs = require('fs');
const util = require('util');
const fetch = require('node-fetch');
const { randomBytes } = require('crypto');
const speed = require('performance-now');
const moment = require('moment-timezone');
const { spawn: spawn, exec } = require('child_process');
const { Primbon } = require('scrape-primbon');
const primbon = new Primbon();
const { performance } = require('perf_hooks');
const path = require('path');
const ytdl = require("ytdl-core");
const colors = require('@colors/colors/safe');
const chalk = require('chalk');
const { getFileFromGithub, updateFileOnGithub } = require("./lib/github");
const { toPTT, toAudio } = require("./lib/converter");
/*
const from = m.key.remoteJid;
const isGroup = from.endsWith("@g.us");
*/
//================= { GITHUB } =================\\
const githubOwner = '';
const githubRepo = '';
const githubFilePath = '';
const githubAccessToken = '';

//================= { CUSTOM LIBRARY } =================\\
const _cmd = JSON.parse(fs.readFileSync('./start/lib/database/command.json'));
const _cmdUser = JSON.parse(fs.readFileSync('./start/lib/database/commandUser.json'));
const { addCountCmd, getPosiCmdUser, addCountCmdUser } = require('./tmp/helpers/command');
const pendaftar = JSON.parse(fs.readFileSync('./start/lib/database/userNumber.json'));
const userPrem = JSON.parse(fs.readFileSync('./start/lib/database/userPremium.json'));

//================= { BASE } =================\\
module.exports = Fastbyte = async (Fastbyte, m, chatUpdate, store) => {
    try {
        var body = (
            (m.mtype === 'conversation') ? m.message?.conversation :
            (m.mtype === 'imageMessage') ? m.message?.imageMessage?.caption :
            (m.mtype === 'videoMessage') ? m.message?.videoMessage?.caption :
            (m.mtype === 'extendedTextMessage') ? m.message?.extendedTextMessage?.text :
            (m.mtype === 'buttonsResponseMessage') ? m.message?.buttonsResponseMessage?.selectedButtonId :
            (m.mtype === 'listResponseMessage') ? m.message?.listResponseMessage?.singleSelectReply?.selectedRowId :
            (m.mtype === 'templateButtonReplyMessage') ? m.message?.templateButtonReplyMessage?.selectedId :
            (m.mtype === 'interactiveResponseMessage') ? JSON.parse(m.message.interactiveResponseMessage.nativeFlowResponseMessage.paramsJson).id :
            (m.mtype === 'messageContextInfo') ? (
                m.message?.buttonsResponseMessage?.selectedButtonId ||
                m.message?.listResponseMessage?.singleSelectReply?.selectedRowId ||
                m.text
            ) : ''
        ) || '';
        var budy = (typeof m.text === 'string' ? m.text : '');
        var prefix = prefa ? 
            (body.match(/^[°•π÷×¶∆£¢€¥®™+✓_=|~!?@#$%^&.©^]/gi)?.[0] || "") 
            : prefa ?? global.prefix;
        const isUser = pendaftar.includes(m.sender);
        const isCmd = typeof body === 'string' && body.startsWith(prefix);
        const command = body.replace(prefix, '').trim().split(/ +/).shift().toLowerCase();
        const args = body.trim().split(/ +/).slice(1);
        const pushname = m.pushName || "No Name";
        const text = q = args.join(" ");
        const fatkuns = (m.quoted || m);
        const quoted = (fatkuns.mtype === 'buttonsMessage') ? fatkuns[Object.keys(fatkuns)[1]] : 
            (fatkuns.mtype === 'templateMessage') ? fatkuns.hydratedTemplate[Object.keys(fatkuns.hydratedTemplate)[1]] : 
            (fatkuns.mtype === 'product') ? fatkuns[Object.keys(fatkuns)[0]] : 
            m.quoted ? m.quoted : m;
        const mime = (quoted.msg || quoted).mimetype || '';
        const qmsg = (quoted.msg || quoted);
        const isMedia = /image|video|sticker|audio/.test(mime);

        //================= { USER } =================\\
        var isAuthor = global.ownNumb.replace(/[^0-9]/g, '').includes(m.sender.split("@")[0]);
        const botNumber = await Fastbyte.decodeJid(Fastbyte.user.id);
        const globalelit = `${global.ownNumb}@s.whatsapp.net`;
        const isOwner = globalelit.includes(m.sender);
        const itsMe = m.sender === botNumber ? true : false;
        const isCreator = [botNumber, ...global.ownNumb].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender);

        // ====> PINDAHKAN KE SINI <====
        const from = m.key.remoteJid;
        const isGroup = from.endsWith("@g.us");
        // ============================

        //================= { GROUP } =================\\
        const groupMetadata = m.isGroup ? await Fastbyte.groupMetadata(m.chat).catch(() => null) : null;
        const groupName = groupMetadata?.subject || '';
        const participants = m.isGroup ? (groupMetadata?.participants || []) : [];
        const groupAdmins = m.isGroup ? await getGroupAdmins(participants) : '';
        const isBotAdmins = m.isGroup ? groupAdmins.includes(botNumber) : false;
        const isAdmins = m.isGroup ? groupAdmins.includes(m.sender) : false;
        const groupOwner = m.isGroup ? groupMetadata?.owner : '';
        const isGroupOwner = m.isGroup ? (groupOwner ? groupOwner : groupAdmins).includes(m.sender) : false;
        //================= { ACCESS } =================\\

        //================= { REACT } =================\\
        const moji = ['📚', '💭', '💫', '🌌', '🌏', '✨', '🌷', '🍁', '🪻', ]
        const randomemoji = moji[Math.floor(Math.random() * moji.length)]

        //================= { PREMIUM } =================\\
        const isPremium = isCreator || isCreator || checkPremiumUser(m.sender, userPrem);

        //================= { TIME } =================\\
        const moment = require('moment-timezone')
        const time2 = moment().tz("Asia/Jakarta").format("HH:mm:ss")
        let ucapanWaktu;

        if (time2 < "03:00:00") {
            ucapanWaktu = "Malam"
        } else if (time2 < "06:00:00") {
            ucapanWaktu = "Subuh"
        } else if (time2 < "11:00:00") {
            ucapanWaktu = "Pagi"
        } else if (time2 < "15:00:00") {
            ucapanWaktu = "Siang"
        } else if (time2 < "19:00:00") {
            ucapanWaktu = "Sore"
        } else {
            ucapanWaktu = "Malam"
        }
        const wib = moment(Date.now()).tz("Asia/Jakarta").locale("id").format("HH:mm:ss z")
        const wita = moment(Date.now()).tz("Asia/Makassar").locale("id").format("HH:mm:ss z")
        const wit = moment(Date.now()).tz("Asia/Jayapura").locale("id").format("HH:mm:ss z")
        const salam2 = moment(Date.now()).tz("Asia/Jakarta").locale("id").format("a")

        //================= { STATUS } =================\\

        if (!Fastbyte.public) {
            if (!m.key.fromMe) return
        }

        //================= {  } =================\\

        try {
            ppuser = await Fastbyte.profilePictureUrl(m.sender, 'image')
        } catch (err) {
            ppuser = 'https://files.catbox.moe/gsbo81.jpg'
        }
        ppnyauser = await getBuffer(ppuser)

        const reSize = async (buffer, ukur1, ukur2) => {
            return new Promise(async (resolve, reject) => {
                let jimp = require('jimp')
                var baper = await jimp.read(buffer);
                var ab = await baper.resize(ukur1, ukur2).getBufferAsync(jimp.MIME_JPEG)
                resolve(ab)
            })
        }
        const fkethmb = await reSize(ppuser, 300, 300)
        let jimp = require("jimp")
        const resize = async (image, width, height) => {
            const read = await jimp.read(image);
            const data = await read.resize(width, height).getBufferAsync(jimp.MIME_JPEG);
            return data;
        };

        const reaction = async (jidss, emoji) => {
            Fastbyte.sendMessage(jidss, {
                react: {
                    text: emoji,
                    key: m.key
                }
            })
        };


        //================= { LIMIT } =================\\

        try {
            const isNumber = x => typeof x === 'number' && !isNaN(x);

            let limitawal = 10;
            let limitUser = isCreator ? 1000 : limitawal;

            if (!global.db) global.db = {};
            if (!global.db.data) global.db.data = {
                users: {},
                chats: {},
                settings: {}
            };
            if (!global.db.data.users) global.db.data.users = {};
            if (!global.db.data.chats) global.db.data.chats = {};
            if (!global.db.data.settings) global.db.data.settings = {};

            let user = global.db.data.users[m.sender] || {};

            if (!global.db.data.users[m.sender]) {
                global.db.data.users[m.sender] = {
                    serialNumber: randomBytes(16).toString('hex'),
                    title: `${isPremium ? 'Premium' : 'User'}`,
                    afkTime: -1,
                    badword: 0,
                    afkReason: '',
                    snlast: 0,
                    warn: 0,
                    email: '',
                    lastgift: 86400000,
                    autolevelup: true,
                    nick: m.sender,
                    premium: isPremium ? true : false,
                    limit: limitUser,
                    level: 0,
                    totalLimit: 0
                };
            }

            user = global.db.data.users[m.sender]; // Pastikan user selalu ada

            if (!isNumber(user.afkTime)) user.afkTime = -1;
            if (!('badword' in user)) user.badword = 0;
            if (!('title' in user)) user.title = '';
            if (!('serialNumber' in user)) user.serialNumber = randomBytes(16).toString('hex');
            if (!('afkReason' in user)) user.afkReason = '';
            if (!('nick' in user)) user.nick = Fastbyte.getName(m.sender);
            if (!('autolevelup' in user)) user.autolevelup = true;
            if (!isPremium) user.premium = false;
            if (!('totalLimit' in user)) user.totalLimit = 0;
            if (!isNumber(user.limit)) user.limit = limitUser;
            if (!isNumber(user.level)) user.level = 0;
            if (!isNumber(user.lastgift)) user.lastgift = 86400000;
            if (!isNumber(user.snlast)) user.snlast = 0;
            if (!isNumber(user.warn)) user.warn = 0;
            if (!isNumber(user.unreglast)) user.unreglast = 0;
            if (!('registered' in user)) user.registered = false;
            if (!user.registered) {
                if (!('email' in user)) user.email = '';
                if (!isNumber(user.codeExpire)) user.codeExpire = 0;
            }

            // Perbaikan objek chats
            let chats = global.db.data.chats[m?.chat] || {};
            global.db.data.chats[m?.chat] = chats;

            let settings = global.db.data.settings || {};
            global.db.data.settings = settings;

            // Scheduler reset limit harian
            const cron = require('node-cron');
            cron.schedule('00 00 * * *', () => {
                let users = Object.keys(global.db.data.users);
                for (let jid of users) {
                    global.db.data.users[jid].claim = 1;
                    if (global.db.data.users[jid].limit < 1) {
                        global.db.data.users[jid].limit = limitawal;
                    }
                }
            }, {
                scheduled: true,
                timezone: "Asia/Makassar"
            });

        } catch (err) {
            console.error("There is an error:", err);
        }

        //======================\\

        const fkontak = {
            key: {
                participant: `0@s.whatsapp.net`,
                ...(m.chat ? {
                    remoteJid: `status@broadcast`
                } : {})
            },
            message: {
                'contactMessage': {
                    'displayName': global.namabot,
                    'vcard': `BEGIN:VCARD\nVERSION:3.0\nN:XL;${pushname},;;;\nFN:${pushname}\nitem1.TEL;waid=6283151623214:6283151623214\nitem1.X-ABLabel:Mobile\nEND:VCARD`,
                    'jpegThumbnail': fkethmb,
                    thumbnail: fkethmb,
                    sendEphemeral: true
                }
            }
        }

        const ftroli = {
            key: {
                remoteJid: '0@g.us',
                participant: '0@s.whatsapp.net'
            },
            message: {
                orderMessage: {
                    itemCount: 999,
                    status: 1,
                    thumbnail: fkethmb,
                    surface: 1,
                    message: "Fastbyte",
                    orderTitle: "Activated!",
                    sellerJid: '0@s.whatsapp.net'
                }
            }
        }

        const qevent = {
            key: {
                participant: `0@s.whatsapp.net`,
                ...(m.chat ? {
                    remoteJid: ""
                } : {})
            },
            'message': {
                "eventMessage": {
                    "isCanceled": false,
                    "name": `${ucapanWaktu}`,
                    "description": "Fastbyte",
                    "location": {
                        "degreesLatitude": 0,
                        "degreesLongitude": 0,
                        "name": "Fastbyte"
                    },
                    "joinLink": "https://call.whatsapp.com/",
                    "startTime": "12345678"
                }
            }
        }

        //======================\\

        const example = (teks) => {
            return `\n *Usage Examples:*\n Type *${prefix+command}* ${teks}\n`
        }
        
        /*
        const reply = (teks) => {
            Fastbyte.sendMessage(m.chat, {
                text: teks
            }, {
                quoted: m
            })
        }
        */
        
        const reply = async (teks) => {
        const FastbyteJob = {
        contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
        newsletterName: `#Fastbyte`,
        newsletterJid: `0@newsletter`,
        },
        externalAdReply: {
        showAdAttribution: true,
        title: `#Fastbyte`, 
        body: `${ucapanWaktu}`, 
        thumbnailUrl: `https://files.catbox.moe/gsbo81.jpg`,
        thumbnail: '',
        sourceUrl: 'https://whatsapp.com/channel/0029VazeUE92Jl8KuVcHIC46', 
        },
        },
        text: teks, 
        };
        return Fastbyte.sendMessage(m.chat, FastbyteJob, {
        quoted: ftroli, ephemeralExpiration: 999,
        });
        };
        

        //================= { PLUGINS } =================\\
        const pluginsLoader = async (directory) => {
            let plugins = [];
            const folders = fs.readdirSync(directory);
            
            folders.forEach(file => {
                const filePath = path.join(directory, file);
                
                if (filePath.endsWith(".cjs")) {
                    try {
                        const resolvedPath = require.resolve(filePath);
                        
                        if (require.cache[resolvedPath]) {
                            delete require.cache[resolvedPath];
                        }
                        
                        const plugin = require(filePath);
                        plugins.push(plugin);
                    } catch (error) {
                        console.log(`Error loading plugin ${filePath}:`, error);
                    }
                }
            });
            
            return plugins;
        };

        const pluginsDisable = true;
        const plugins = await pluginsLoader(path.resolve(__dirname, "../plugins/cjs"));

        const plug = {
            Fastbyte,
            isOwner,
            command,
            isCmd,
            reply,
            addCountCmd,
            getPosiCmdUser,
            randomemoji,
            isCreator,
            example,
            quoted,
            reaction,
            text,
            fetchJson,
            args,
            botNumber,
            pushname,
            isGroup: m.isGroup,
            isPrivate: !m.isGroup,
            pickRandom,
            prefix,
            ftroli,
            fkontak
        };

        for (let plugin of plugins) {
            if (plugin.command.find(e => e == command.toLowerCase())) {
                if (plugin.owner && !isOwner) {
                    return m.reply(mess.owner);
                }
                if (plugin.group && !plug.isGroup) {
                    return m.reply(mess.ingroup);
                }
                if (plugin.private && !plug.isPrivate) {
                    return m.reply(mess.private);
                }
        
                if (plugin.limit) {
                    let user = global.db.data.users[m.sender];
                    if (!user || user.limit <= 0) {
                        return m.reply(mess.limit);
                    }
                    user.limit -= 1;
                }
        
                if (typeof plugin.execute !== "function") return;
                await plugin.execute(m, plug);
            }
        }


        //================= { CONSOLE LOGS } =================\\
        if (m.message) {
            let header = chalk.black(chalk.bgHex("#ff5e78").bold(`\n🌟 ${ucapanWaktu} 🌟`));
            let title = chalk.white(chalk.bgHex("#4a69bd").bold("🚀 There is a message 🚀"));
            let date = chalk.cyanBright(`📅 DATE        : ${new Date().toLocaleString()}`);
            let sender = chalk.yellowBright(`🗣️ SENDERNAME : ${pushname}`);
            let jid = chalk.magentaBright(`👤 JIDS       : ${m.sender}`);

            if (isCmd && !m.isGroup) {
                console.log(header);
                console.log(title);
                console.log(date);
                console.log(sender);
                console.log(jid);
                console.log(chalk.white("------------------------------------------"));
            } else if (m.isGroup) {
                let group = chalk.redBright(`🔍 MESS LOCATION : ${groupName}`);

                console.log(header);
                console.log(title);
                console.log(date);
                console.log(sender);
                console.log(jid);
                console.log(group);
                console.log(chalk.white("------------------------------------------"));
            }
        }


        if (isCmd && !isUser) {
            pendaftar.push(m.sender)
            fs.writeFileSync('./start/lib/database/userNumber.json', JSON.stringify(pendaftar, null, 2))
        }

        //================= { SWITCH CASE } =================\\
        const caseHandler = require('../case/case');
        await caseHandler(Fastbyte, m, command, args, isOwner, isCreator, isCmd, prefix, pushname, ftroli, fkontak, randomemoji, ucapanWaktu, pendaftar, budy);

    } catch (err) {
        const errId = `${global.ownNumb}@s.whatsapp.net`
        Fastbyte.sendMessage(errId, {
            text: require('util').format(err)
        }, {
            quoted: m
        })
        console.log('\x1b[1;31m' + err + '\x1b[0m')
    }
}

//================= { FILE WATCHER } =================\\
let file = require.resolve(__filename)
require('fs').watchFile(file, () => {
    require('fs').unwatchFile(file)
    console.log('\x1b[0;32m' + __filename + ' \x1b[1;32mupdated!\x1b[0m')
    delete require.cache[file]
    require(file)
})