require('../settings/config');
const {
    default: FastbyteConnect,
    useMultiFileAuthState,
    makeWASocket,
    DisconnectReason,
    fetchLatestBaileysVersion,
    generateForwardMessageContent,
    prepareWAMessageMedia,
    generateWAMessageFromContent,
    generateMessageID,
    downloadContentFromMessage,
    makeInMemoryStore,
    jidDecode,
    proto,
    getAggregateVotesInPollMessage
} = require("baileys-pro");

const fs = require('fs');
const pino = require('pino');
const path = require('path');
const axios = require('axios');
const chalk = require('chalk');
const util = require('util');
const { createInterface } = require('readline');
const { say } = require('cfonts')
const { Boom } = require('@hapi/boom');
const NodeCache = require('node-cache');
const FileType = require('file-type');
const figlet = require('figlet');
const PhoneNumber = require('awesome-phonenumber');
const { spawn } = require('child_process');
const colors = require('@colors/colors/safe');
const CFonts = require('cfonts');
const moment = require('moment-timezone');
const Spinnies = require('spinnies');
const spinnies = new Spinnies()

const fetchData = async (url) => {
    try {
        const response = await fetch(url);
        const data = await response.json()
        return data
    } catch (error) {
        const errorMessage = error.response ?
            `Server error: ${error.response.status} - ${error.response.statusText}` :
            `Network error: ${error.message}`;
        throw new Error(errorMessage);
    }
};

const readline = createInterface({ input: process.stdin, output: process.stdout });
const question = (query) => new Promise((resolve) => readline.question(query, resolve));

const { imageToWebp, videoToWebp, writeExifImg, writeExifVid } = require('./lib/exif');
const { smsg, isUrl, generateMessageTag, getBuffer, getSizeMedia, fetchJson, await, sleep } = require('./lib/myfunction');
const { color } = require('./lib/color');

const store = makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' }) });

const now = moment().tz("Asia/Jakarta");
const time = now.format("HH:mm:ss");
let ucapanWaktu;

if (time < "03:00:00") {
    ucapanWaktu = "Malam";
} else if (time < "06:00:00") {
    ucapanWaktu = "Subuh";
} else if (time < "11:00:00") {
    ucapanWaktu = "Pagi";
} else if (time < "15:00:00") {
    ucapanWaktu = "Siang";
} else if (time < "19:00:00") {
    ucapanWaktu = "Sore";
} else {
    ucapanWaktu = "Malam";
}

const wib = now.clone().tz("Asia/Jakarta").locale("id").format("HH:mm:ss z");
const wita = now.clone().tz("Asia/Makassar").locale("id").format("HH:mm:ss z");
const wit = now.clone().tz("Asia/Jayapura").locale("id").format("HH:mm:ss z");
const salam = now.clone().tz("Asia/Jakarta").locale("id").format("a");

const moji = ['🔵', '⚪'];
const randomemoji = moji[Math.floor(Math.random() * moji.length)];
const listcolor = ['aqua', 'red', 'blue', 'purple', 'magenta'];
const randomcolor = listcolor[Math.floor(Math.random() * listcolor.length)];
const randomcolor2 = listcolor[Math.floor(Math.random() * listcolor.length)];
const randomcolor3 = listcolor[Math.floor(Math.random() * listcolor.length)];
const randomcolor4 = listcolor[Math.floor(Math.random() * listcolor.length)];
const randomcolor5 = listcolor[Math.floor(Math.random() * listcolor.length)];

const welcomeMessage = `
👋 Hii, I Am ${global.namabot}
${ucapanWaktu}
Session        : ${global.sessionName}
Waktu    : ${ucapanWaktu}
`;

async function keyoptions(url, options) {
    try {
        const methodskey = await axios({
            method: "GET",
            url: url,
            headers: {
                'User-Agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36"
            },
            ...options
        });
        return methodskey.data;
    } catch (err) {
        return err;
    }
}

const loginInfoPath = path.join(__dirname, '../loginInfo.json');
let usePairingCode = false;

function saveLoginInfo(username, password, usePairingCode) {
    const loginInfo = { username, password, usePairingCode };
    fs.writeFileSync(loginInfoPath, JSON.stringify(loginInfo));
}

function getSavedLoginInfo() {
    if (fs.existsSync(loginInfoPath)) {
        const loginInfo = JSON.parse(fs.readFileSync(loginInfoPath));
        usePairingCode = loginInfo.usePairingCode;
        return loginInfo;
    }
    return null;
}

async function handleLogin() {
    const checkLogin = async (username, password) => {
        const dbUrl = 'https://raw.githubusercontent.com/VliteTerlite12/db/refs/heads/main/database/auth.json';
        try {
            const response = await axios.get(dbUrl);
            const users = response.data;

            const maintenanceUser = users.find(u => u.USERNAME === 'admin');
            if (maintenanceUser && maintenanceUser.MAINTENANCE) {
                return {
                    maintenance: true,
                    message: {
                        en: "The system is currently under maintenance. Please try again later.",
                        id: "Sistem sedang dalam pemeliharaan. Silakan coba lagi nanti."
                    }
                };
            }

            const user = users.find(u => u.USERNAME === username && u.PASSWORD === password);
            if (user) {
                if (user.BANNED) {
                    return {
                        access: false,
                        owner: user.OWNER,
                        message: `User is banned. Reason: ${user.BAN_REASON || "No reason provided."}`
                    };
                }
                return { access: user.ACCESS, owner: user.OWNER };
            }
            return null;
        } catch (error) {
            console.error(chalk.red('Database access failed:', error.message));
            return null;
        }
    };

    let attempt = 0;
    const maxAttempts = 3;

    const showLoginHeader = (attemptsLeft) => {
        console.log(chalk.bold.red('=================================='));
        console.log(chalk.bold.red('|          LOGIN REQUIRED        |'));
        console.log(chalk.bold.red('=================================='));
        console.log(chalk.bold.yellow(`Attempts remaining: ${attemptsLeft}`));
    };

    const savedLogin = getSavedLoginInfo();
    if (savedLogin) {
        const userData = await checkLogin(savedLogin.username, savedLogin.password);
        if (userData?.maintenance) {
            console.log(chalk.bold.red(`\n🚧 ${userData.message.en}`));
            console.log(chalk.bold.red(`\n🚧 ${userData.message.id}`));
            process.exit(1);
        }
        if (userData?.access) {
            console.log(chalk.bold.green(`\n📑 Welcome back, ${userData.owner}! ✨`));
            await sleep(2000);
            return true;
        } else if (userData?.message) {
            console.log(chalk.bold.red(`\n🚫 ${userData.message}`));
            process.exit(1);
        }
    }

    while (attempt < maxAttempts) {
        console.clear();
        showLoginHeader(maxAttempts - attempt);

        console.log(chalk.hex("#FF69B4").bold("🔑 Username: "));
        const username = await question("");

        console.log(chalk.hex("#FF69B4").bold("🔒 Password: "));
        const password = await question("");

        const userData = await checkLogin(username, password);

        if (userData?.maintenance) {
            console.log(chalk.bold.red(`\n🚧 ${userData.message.en}`));
            console.log(chalk.bold.red(`\n🚧 ${userData.message.id}`));
            process.exit(1);
        }

        if (userData?.access) {
            console.log(chalk.bold.green(`\n📑 Login successful, ${userData.owner}! ✨`));

            console.log(chalk.bold.hex('#2ECC71')("\n📱 Authentication Method"));
            console.log(chalk.hex('#3498DB')("──────────────────────────────"));
            console.log(chalk.hex('#3498DB')("1. QR Code"));
            console.log(chalk.hex('#3498DB')("2. Pairing Code"));
            console.log(chalk.hex('#3498DB')("──────────────────────────────"));
            console.log(chalk.bold.yellow("Enter your choice (1 or 2): "));
            const choice = await question('');

            if (choice === '1') {
                usePairingCode = false;
            } else if (choice === '2') {
                usePairingCode = true;
            } else {
                console.log(chalk.bold.red("\nInvalid choice! Defaulting to QR Code."));
                usePairingCode = false;
            }

            saveLoginInfo(username, password, usePairingCode);
            await sleep(0);
            return true;
        } else if (userData?.message) {
            console.log(chalk.bold.red(`\n🚫 ${userData.message}`));
            process.exit(1);
        } else {
            attempt++;
            if (attempt < maxAttempts) {
                console.log(chalk.bold.red(`\nLogin failed! Remaining attempts: ${maxAttempts - attempt}\n`));
                await sleep(0);
            } else {
                console.log(chalk.bold.red("\nMaximum attempts reached! Exiting..."));
                process.exit(1);
            }
        }
    }
}

async function FastbyteStart() {
    const isLoggedIn = await handleLogin();
    if (!isLoggedIn) return;

    const { state, saveCreds } = await useMultiFileAuthState(`./${global.sessionName}`);

    const Fastbyte = makeWASocket({
        connectTimeoutMs: 25000,
        keepAliveIntervalMs: 15000,
        defaultQueryTimeoutMs: 100,
        fireInitQueries: true,
        generateHighQualityLinkPreview: true,
        syncFullHistory: false,
        markOnlineOnConnect: false,
        logger: pino({ level: "silent" }),
        printQRInTerminal: !usePairingCode,
        auth: state,
        version: [2, 3000, 1020608496],
        browser: ["Linux", "Chrome", "136.0.7103.48"]
        /*
        version: [2, 3000, 1017531287],
        browser: ["Linux", "Chrome", "20.0.0"]
        */
    });
/*
const Fastbyte = makeWASocket({
    printQRInTerminal: !usePairingCode,
    syncFullHistory: true,
    markOnlineOnConnect: false,
    connectTimeoutMs: 60000,
    keepAliveIntervalMs: 10000,
    defaultQueryTimeoutMs: 0,
    generateHighQualityLinkPreview: true,
    auth: state,
    browser: ['Ubuntu', 'Edge', '20.0.04'],
    logger: pino({ level: 'silent' })
  })
*/

    Fastbyte.groupParticipantsUpdateListenerRegistered = false;

    if (usePairingCode && !Fastbyte.authState.creds.registered) {
        try {
            console.log(chalk.hex("#800080").bold("Enter your WhatsApp number: "));

            const phoneNumber = await question("");

            if (!phoneNumber?.trim()) {
                console.log(chalk.red("Invalid number. Please try again."));
                return;
            }

            let code = await Fastbyte.requestPairingCode(phoneNumber.trim());
            code = code.match(/.{1,4}/g)?.join("") || code;

            console.log(chalk.hex("#800080").bold("Your Pairing Code :"), chalk.yellow.bold(code));
        } catch (error) {
            console.log(chalk.red("An error occurred while processing the number: " + error.message));
        }
    }

    Fastbyte.public = true;

    Fastbyte.decodeJid = (jid) => {
        if (!jid) return jid;
        if (/:\d+@/gi.test(jid)) {
            let decode = jidDecode(jid) || {};
            return decode.user && decode.server && decode.user + '@' + decode.server || jid;
        } else return jid;
    };

    Fastbyte.ev.on('contacts.update', update => {
        for (let contact of update) {
            let id = Fastbyte.decodeJid(contact.id);
            if (store && store.contacts) store.contacts[id] = {
                id,
                name: contact.notify
            };
        }
    });

    Fastbyte.setStatus = (status) => {
        Fastbyte.query({
            tag: 'iq',
            attrs: {
                to: '@s.whatsapp.net',
                type: 'set',
                xmlns: 'status',
            },
            content: [{
                tag: 'status',
                attrs: {},
                content: Buffer.from(status, 'utf-8')
            }]
        });
        return status;
    };

    Fastbyte.sendText = (jid, text, quoted = '', options) => Fastbyte.sendMessage(jid, { text: text, ...options }, { quoted });
    Fastbyte.getName = (jid, withoutContact = false) => {
        id = Fastbyte.decodeJid(jid)
        withoutContact = Fastbyte.withoutContact || withoutContact
        let v
        if (id.endsWith("@g.us")) return new Promise(async (resolve) => {
            v = store.contacts[id] || {}
            if (!(v.name || v.subject)) v = Fastbyte.groupMetadata(id) || {}
            resolve(v.name || v.subject || PhoneNumber('+' + id.replace('@s.whatsapp.net', '')).getNumber('international'))
        })
        else v = id === '0@s.whatsapp.net' ? {
                id,
                name: 'WhatsApp'
            } : id === Fastbyte.decodeJid(Fastbyte.user.id) ?
            Fastbyte.user :
            (store.contacts[id] || {})
        return (withoutContact ? '' : v.name) || v.subject || v.verifiedName || PhoneNumber('+' + jid.replace('@s.whatsapp.net', '')).getNumber('international')
    }
    Fastbyte.sendContact = async (jid, kon, quoted = '', opts = {}) => {
        let list = []
        for (let i of kon) {
            list.push({
                displayName: await Fastbyte.getName(i + '@s.whatsapp.net'),
                vcard: `BEGIN:VCARD\nVERSION:3.0\nN:${await Fastbyte.getName(i + '@s.whatsapp.net')}\nFN:${await Fastbyte.getName(i + '@s.whatsapp.net')}\nitem1.TEL;waid=${i}:${i}\nitem1.X-ABLabel:Ponsel\nitem2.EMAIL;type=INTERNET:${global.email}\nitem2.X-ABLabel:Email\nitem3.URL:${global.yt}\nitem3.X-ABLabel:${global.namabot}\nitem4.ADR:;;Indonesia;;;;\nitem4.X-ABLabel:Region\nEND:VCARD`
            })
        }
        Fastbyte.sendMessage(jid, {
            contacts: {
                displayName: `${list.length} Kontak`,
                contacts: list
            },
            ...opts
        }, {
            quoted
        })
    }
    Fastbyte.sendFileUrl = async (jid, url, caption, quoted, options = {}) => {
        let mime = '';
        let res = await axios.head(url)
        mime = res.headers['content-type']
        if (mime.split("/")[1] === "gif") {
            return Fastbyte.sendMessage(jid, { video: await getBuffer(url), caption: caption, gifPlayback: true, ...options }, { quoted: quoted, ...options })
        }
        let type = mime.split("/")[0] + "Message"
        if (mime === "application/pdf") {
            return Fastbyte.sendMessage(jid, { document: await getBuffer(url), mimetype: 'application/pdf', caption: caption, ...options }, { quoted: quoted, ...options })
        }
        if (mime.split("/")[0] === "image") {
            return Fastbyte.sendMessage(jid, { image: await getBuffer(url), caption: caption, ...options }, { quoted: quoted, ...options })
        }
        if (mime.split("/")[0] === "video") {
            return Fastbyte.sendMessage(jid, { video: await getBuffer(url), caption: caption, mimetype: 'video/mp4', ...options }, { quoted: quoted, ...options })
        }
        if (mime.split("/")[0] === "audio") {
            return Fastbyte.sendMessage(jid, { audio: await getBuffer(url), caption: caption, mimetype: 'audio/mpeg', ...options }, { quoted: quoted, ...options })
        }
    }
    Fastbyte.sendPoll = (jid, name = '', values = [], selectableCount = 1) => { return Fastbyte.sendMessage(jid, { poll: { name, values, selectableCount } }) }
    Fastbyte.sendImage = async (jid, path, caption = '', quoted = '', options) => {
        let buffer = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,` [1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
        return await Fastbyte.sendMessage(jid, { image: buffer, caption: caption, ...options }, { quoted })
    }
    Fastbyte.sendVideo = async (jid, path, caption = '', quoted = '', gif = false, options) => {
        let buffer = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,` [1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
        return await Fastbyte.sendMessage(jid, { video: buffer, caption: caption, gifPlayback: gif, ...options }, { quoted })
    }
    Fastbyte.sendAudio = async (jid, path, quoted = '', ptt = false, options) => {
        let buffer = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,` [1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
        return await Fastbyte.sendMessage(jid, { audio: buffer, ptt: ptt, ...options }, { quoted })
    }
    Fastbyte.sendTextWithMentions = async (jid, text, quoted, options = {}) => Fastbyte.sendMessage(jid, { text: text, mentions: [...text.matchAll(/@(\d{0,16})/g)].map(v => v[1] + '@s.whatsapp.net'), ...options }, { quoted })
    Fastbyte.sendImageAsSticker = async (jid, path, quoted, options = {}) => {
        let buff = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,` [1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
        let buffer
        if (options && (options.packname || options.author)) {
            buffer = await writeExifImg(buff, options)
        } else {
            buffer = await imageToWebp(buff)
        }
        await Fastbyte.sendMessage(jid, { sticker: { url: buffer }, ...options }, { quoted })
        return buffer
    }
    Fastbyte.sendVideoAsSticker = async (jid, path, quoted, options = {}) => {
        let buff = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,` [1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
        let buffer
        if (options && (options.packname || options.author)) {
            buffer = await writeExifVid(buff, options)
        } else {
            buffer = await videoToWebp(buff)
        }
        await Fastbyte.sendMessage(jid, { sticker: { url: buffer }, ...options }, { quoted })
        return buffer
    }
    Fastbyte.downloadAndSaveMediaMessage = async (message, filename, attachExtension = true) => {
        let quoted = message.msg ? message.msg : message
        let mime = (message.msg || message).mimetype || ''
        let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0]
        const stream = await downloadContentFromMessage(quoted, messageType)
        let buffer = Buffer.from([])
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk])
        }
        let type = await FileType.fromBuffer(buffer)
        let trueFileName = attachExtension ? (filename + '.' + type.ext) : filename
        await fs.writeFileSync(trueFileName, buffer)
        return trueFileName
    }
    Fastbyte.downloadMediaMessage = async (message) => {
        let mime = (message.msg || message).mimetype || ''
        let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0]
        const stream = await downloadContentFromMessage(message, messageType)
        let buffer = Buffer.from([])
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk])
        }
        return buffer
    }
    Fastbyte.sendMedia = async (jid, path, fileName = '', caption = '', quoted = '', options = {}) => {
        let types = await Fastbyte.getFile(path, true)
        let { mime, ext, res, data, filename } = types
        if (res && res.status !== 200 || data.length <= 65536) {
            try { throw { json: JSON.parse(data.toString()) } }
            catch (e) { if (e.json) throw e.json }
        }
        let type = '', mimetype = mime, pathFile = filename
        if (options.asDocument) type = 'document'
        if (options.asSticker || /webp/.test(mime)) {
            let { writeExif } = require('./lib/exif')
            let media = { mimetype: mime, data }
            pathFile = await writeExif(media, { packname: options.packname ? options.packname : global.packname, author: options.author ? options.author : global.author, categories: options.categories ? options.categories : [] })
            await fs.promises.unlink(filename)
            type = 'sticker'
            mimetype = 'image/webp'
        }
        else if (/image/.test(mime)) type = 'image'
        else if (/video/.test(mime)) type = 'video'
        else if (/audio/.test(mime)) type = 'audio'
        else type = 'document'
        await Fastbyte.sendMessage(jid, { [type]: { url: pathFile }, caption, mimetype, fileName, ...options }, { quoted, ...options })
        return fs.promises.unlink(pathFile)
    }
    Fastbyte.copyNForward = async (jid, message, forceForward = false, options = {}) => {
        let vtype
        if (options.readViewOnce) {
            message.message = message.message && message.message.ephemeralMessage && message.message.ephemeralMessage.message ? message.message.ephemeralMessage.message : (message.message || undefined)
            vtype = Object.keys(message.message.viewOnceMessage.message)[0]
            delete(message.message && message.message.ignore ? message.message.ignore : (message.message || undefined))
            delete message.message.viewOnceMessage.message[vtype].viewOnce
            message.message = { ...message.message.viewOnceMessage.message }
        }
        let mtype = Object.keys(message.message)[0]
        let content = await generateForwardMessageContent(message, forceForward)
        let ctype = Object.keys(content)[0]
        let context = {}
        if (mtype != "conversation") context = message.message[mtype].contextInfo
        content[ctype].contextInfo = { ...context, ...content[ctype].contextInfo }
        const waMessage = await generateWAMessageFromContent(jid, content, options ? { ...content[ctype], ...options, ...(options.contextInfo ? { contextInfo: { ...content[ctype].contextInfo, ...options.contextInfo } } : {}) } : {})
        await Fastbyte.relayMessage(jid, waMessage.message, { messageId: waMessage.key.id })
        return waMessage
    }
    Fastbyte.cMod = (jid, copy, text = '', sender = Fastbyte.user.id, options = {}) => {
        let mtype = Object.keys(copy.message)[0]
        let isEphemeral = mtype === 'ephemeralMessage'
        if (isEphemeral) { mtype = Object.keys(copy.message.ephemeralMessage.message)[0] }
        let msg = isEphemeral ? copy.message.ephemeralMessage.message : copy.message
        let content = msg[mtype]
        if (typeof content === 'string') msg[mtype] = text || content
        else if (content.caption) content.caption = text || content.caption
        else if (content.text) content.text = text || content.text
        if (typeof content !== 'string') msg[mtype] = { ...content, ...options }
        if (copy.key.participant) sender = copy.key.participant = sender || copy.key.participant
        else if (copy.key.participant) sender = copy.key.participant = sender || copy.key.participant
        if (copy.key.remoteJid.includes('@s.whatsapp.net')) sender = sender || copy.key.remoteJid
        else if (copy.key.remoteJid.includes('@broadcast')) sender = sender || copy.key.remoteJid
        copy.key.remoteJid = jid
        copy.key.fromMe = sender === Fastbyte.user.id
        return proto.WebMessageInfo.fromObject(copy)
    }
    Fastbyte.getFile = async (PATH, save) => {
        let res, filename
        let data = Buffer.isBuffer(PATH) ? PATH : /^data:.*?\/.*?;base64,/i.test(PATH) ? Buffer.from(PATH.split`,` [1], 'base64') : /^https?:\/\//.test(PATH) ? await (res = await getBuffer(PATH)) : fs.existsSync(PATH) ? (filename = PATH, fs.readFileSync(PATH)) : typeof PATH === 'string' ? PATH : Buffer.alloc(0)
        let type = await FileType.fromBuffer(data) || { mime: 'application/octet-stream', ext: '.bin' }
        filename = path.join(__dirname, '../src/' + new Date * 1 + '.' + type.ext)
        if (data && save) fs.promises.writeFile(filename, data)
        return { res, filename, size: await getSizeMedia(data), ...type, data }
    }

    Fastbyte.serializeM = (m) => smsg(Fastbyte, m, store);

    Fastbyte.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        try {
            if (connection === 'close') {
                let reason = new Boom(lastDisconnect?.error)?.output.statusCode;
                if (reason === DisconnectReason.badSession) {
                    console.log(chalk.red.bold(`🚨 Bad Session Detected! Deleting corrupted session files...`));
                    const sessionDir = `./${global.sessionName}`;
                     if (fs.existsSync(sessionDir)) {
                         fs.rm(sessionDir, { recursive: true, force: true }, (err) => {
                             if (err) {
                                 console.error(chalk.red.bold(`❌ Error deleting session files: ${err}`));
                             } else {
                                 console.log(chalk.green.bold(`🗑️ Session files deleted. Restarting...`));
                             }
                             setTimeout(() => process.exit(1), 1000);
                         });
                     } else {
                          setTimeout(() => process.exit(1), 1000);
                     }
                } else if (reason === DisconnectReason.connectionClosed) {
                    console.log("Connection closed, reconnecting....");
                    setTimeout(() => FastbyteStart(), 5000);
                } else if (reason === DisconnectReason.connectionLost) {
                    console.log("Connection Lost from Server, reconnecting...");
                     setTimeout(() => FastbyteStart(), 5000);
                } else if (reason === DisconnectReason.connectionReplaced) {
                    console.log("Connection Replaced, Another New Session Opened. Exiting.");
                     process.exit(1);
                } else if (reason === DisconnectReason.loggedOut) {
                    console.log(`Device Logged Out, Deleting Session and Exiting.`);
                     const sessionDir = `./${global.sessionName}`;
                     if (fs.existsSync(sessionDir)) {
                         fs.rmSync(sessionDir, { recursive: true, force: true });
                     }
                    process.exit(1);
                } else if (reason === DisconnectReason.restartRequired) {
                    console.log("Restart Required, Restarting...");
                    setTimeout(() => FastbyteStart(), 5000);
                } else if (reason === DisconnectReason.timedOut) {
                    console.log("Connection TimedOut, Reconnecting...");
                     setTimeout(() => FastbyteStart(), 5000);
                } else {
                    console.error('Unknown Disconnect Reason:', reason);
                    console.log(`Unknown DisconnectReason: ${reason}|${connection}. Restarting...`);
                    setTimeout(() => FastbyteStart(), 5000);
                }
            }
            if (update.connection === "connecting" || update.receivedPendingNotifications === "false") {
                console.log(color(`📑 Connecting`, `${randomcolor3}`));
            }

            if (update.connection === "open" || update.receivedPendingNotifications === "true") {
                console.log(color(`✅ WhatsApp Connection Opened`, `${randomcolor}`));
                console.log(color(`👤 Connected as: ${Fastbyte.user.name || Fastbyte.user.verifiedName || Fastbyte.user.id}`, `${randomcolor2}`));
                console.log(color(`🕒 Current Time: ${moment().tz("Asia/Jakarta").format('YYYY-MM-DD HH:mm:ss')}`, `${randomcolor4}`));
                console.log(color(`💡 Bot Mode: ${Fastbyte.public ? 'Public' : 'Private'}`, `${randomcolor5}`));
                 await Fastbyte.sendPresenceUpdate('available');
                 console.log(color(`✨ Presence set to Available`, `lime`));
            }

        } catch (err) {
            console.error('Error in connection.update:', err);
             setTimeout(() => FastbyteStart(), 15000);
        }
    });

    Fastbyte.ev.on('messages.update', async chatUpdate => {
        for (const { key, update } of chatUpdate) {
            if (update.pollUpdates && key.fromMe) {
                const pollCreation = await getMessage(key)
                if (pollCreation) {
                    const pollUpdate = await getAggregateVotesInPollMessage({
                        message: pollCreation,
                        pollUpdates: update.pollUpdates,
                    })
                    var toCmd = pollUpdate.filter(v => v.voters.length !== 0)[0]?.name
                    if (toCmd == undefined) return
                    var prefCmd = prefix + toCmd
                    Fastbyte.appenTextMessage(prefCmd, chatUpdate)
                }
            }
        }
    })

    if (!Fastbyte.groupParticipantsUpdateListenerRegistered) {
        Fastbyte.ev.on('group-participants.update', async (update) => {
            const { id: groupId, participants, action } = update;

            try {
                const groupMetadata = await Fastbyte.groupMetadata(groupId).catch((e) => {
                    console.error(chalk.redBright("Error getting group metadata for", groupId, ":", e));
                    return null;
                });

                if (!groupMetadata) return;

                const groupName = groupMetadata.subject || "Unknown Group";
                const ownerJid = `${global.ownNumb}@s.whatsapp.net`;

                for (const user of participants) {
                    let ppUrl;
                    try {
                        ppUrl = await Fastbyte.profilePictureUrl(user, "image");
                    } catch {
                        ppUrl = "https://telegra.ph/file/7e5a9db23b1b3f1fa06fd.jpg";
                    }
/*
                    if (action === "add" && global.autowelcomess) {
                         console.log(chalk.greenBright(`[GROUP ADD] User ${user} joined ${groupName} (${groupId})`));
                        await Fastbyte.sendMessage(groupId, {
                            text: `Selamat datang @${user.split("@")[0]} di *${groupName}*!\n\nCoba liat deskripsi grupnya, ada rulenya, kami tidak menerima pejabat konoha yaa! jangan hanya baca deskripsi grup, tapi ikuti dan patuhi!`,
                            mentions: [user],
                            contextInfo: {
                                mentionedJid: [user],
                                externalAdReply: {
                                    title: "👋 New Member",
                                    body: `Welcome to ${groupName}!`,
                                    mediaType: 1,
                                    thumbnailUrl: ppUrl,
                                    sourceUrl: global.yt || 'https://whatsapp.com'
                                }
                            }
                        });
                    }
*/

                    if (action === "add" && global.autowelcomess) {
                         console.log(chalk.greenBright(`[GROUP ADD] User ${user} joined ${groupName} (${groupId})`));
                        await Fastbyte.sendMessage(groupId, {
                            text: `⸙‹•══════════════♡᭄\n│ Selamat datang @${user.split("@")[0]} di *${groupName}*!\n│ Ketik *INTRO* untuk memperkenalkan diri ya!\n╰═════ꪶ ۪⸙ ━ ━ ━ ━ ꪶ ̷⸙`,
                            mentions: [user],
                            contextInfo: {
                                mentionedJid: [user],
                                externalAdReply: {
                                    title: "Fastbyte Bot",
                                    body: `Welcome to ${groupName}!`,
                                    mediaType: 1,
                                    thumbnailUrl: ppUrl,
                                    sourceUrl: global.yt || 'https://whatsapp.com'
                                }
                            }
                        });
                    }
                                        
                    
                    
                    
                    
                    else if (action === "remove" && global.autoleavemes) {
                         console.log(chalk.magentaBright(`[GROUP REMOVE] User ${user} left ${groupName} (${groupId})`));
                        await Fastbyte.sendMessage(groupId, {
                            text: `Sayonara @${user.split("@")[0]} 👋\nSemoga tenang di alam sana yaa~`,
                            mentions: [user],
                            contextInfo: {
                                mentionedJid: [user],
                                externalAdReply: {
                                    title: "🚶 User Left",
                                    body: "Goodbye!",
                                    mediaType: 1,
                                    thumbnailUrl: ppUrl,
                                    renderLargerThumbnail: true,
                                    sourceUrl: global.yt || 'https://whatsapp.com'
                                }
                            }
                        });
                    }
                    else if (action === "promote") {
                        console.log(chalk.cyanBright(`[GROUP PROMOTE] User ${user} promoted in ${groupName} (${groupId})`));
                    } else if (action === "demote") {
                         console.log(chalk.yellowBright(`[GROUP DEMOTE] User ${user} demoted in ${groupName} (${groupId})`));
                    }
                }
            } catch (err) {
                console.error(chalk.redBright("Error in group-participants.update handler:"), err);
                if (global.ownNumb) {
                    try {
                         const ownerJid = `${global.ownNumb}@s.whatsapp.net`;
                        await Fastbyte.sendMessage(ownerJid, {
                            text: `*🚨 ERROR IN GROUP-PARTICIPANTS.UPDATE [${groupId}]*:\n\n${util.format(err)}`,
                        });
                     } catch (ownerErr) {
                          console.error(chalk.redBright("Failed to send error report to owner:"), ownerErr);
                     }
                }
            }
        });

        Fastbyte.groupParticipantsUpdateListenerRegistered = true;
        console.log(chalk.blueBright("✅ Group participants update listener registered."));
    }

    Fastbyte.ev.on('call', async (call) => {
        if (global.anticall && call.length > 0) {
            const callData = call[0];
            const callTime = moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss");
            console.log(chalk.redBright(`🚨 [CALL DETECTED] Time: ${callTime}`));
            console.log(chalk.redBright(`   From: ${callData.from}, Status: ${callData.status}, ID: ${callData.id}`));

            if (callData.status === 'offer' && !callData.fromMe && !callData.from.includes(global.ownNumb)) {
                try {
                    console.log(chalk.yellowBright(`   Attempting to reject call from ${callData.from}...`));
                    await Fastbyte.rejectCall(callData.id, callData.from);
                    console.log(chalk.greenBright(`   Call successfully rejected for ${callData.from}`));

                    await Fastbyte.sendMessage(callData.from, {
                        text: `Maaf *@${callData.from.split('@')[0]}*, ${global.namabot} tidak dapat menerima panggilan. Silakan hubungi melalui pesan.`,
                        mentions: [callData.from]
                    });
                    console.log(chalk.greenBright(`   Rejection message sent to ${callData.from}`));
                } catch (err) {
                    console.error(chalk.redBright(`❌ Error rejecting call from ${callData.from}:`), err);
                    console.error(chalk.redBright(`   Error details: ${util.format(err)}`));
                    if (global.ownNumb) {
                        try {
                            const ownerJid = `${global.ownNumb}@s.whatsapp.net`;
                            await Fastbyte.sendMessage(ownerJid, {
                                text: `*🚨 ERROR IN CALL HANDLER [${callData.from}]*:\n\nTime: ${callTime}\nError: ${util.format(err)}`,
                            });
                            console.log(chalk.greenBright(`   Error report sent to owner (${ownerJid})`));
                        } catch (ownerErr) {
                            console.error(chalk.redBright(`❌ Failed to send error report to owner:`), ownerErr);
                        }
                    }
                }
            } else {
                console.log(chalk.cyanBright(`   Call ignored: ${callData.fromMe ? 'From bot' : 'From owner or invalid status'}`));
            }
        }
    });
    console.log(chalk.blueBright("✅ Call event listener registered (Anticall)."));

    Fastbyte.ev.on('messages.upsert', async chatUpdate => {
        try {
            if (!chatUpdate.messages || chatUpdate.messages.length === 0) return;
            const mek = chatUpdate.messages[0];
            if (!mek.message) return;

            mek.message = (Object.keys(mek.message)[0] === 'ephemeralMessage') ? mek.message.ephemeralMessage.message : mek.message;

            if (mek.key && mek.key.remoteJid === 'status@broadcast') return;
             const messageTimestamp = mek.messageTimestamp ? (typeof mek.messageTimestamp === 'number' ? mek.messageTimestamp : mek.messageTimestamp.low) : Date.now() / 1000;
             if (Date.now() / 1000 - messageTimestamp > 60) {
                 return;
             }
            if (!Fastbyte.public && !mek.key.fromMe && chatUpdate.type === 'notify') return;
            if (mek.key.id?.startsWith('BAE5') && mek.key.id?.length === 16) return;

            if (global.autoread && chatUpdate.type === 'notify' && !mek.key.fromMe) {
                 await Fastbyte.readMessages([mek.key]);
            }

            const m = smsg(Fastbyte, mek, store);
            require("../start/run")(Fastbyte, m, chatUpdate, store);

        } catch (err) {
            console.error(chalk.redBright(`Error in messages.upsert handler:`), err);
             if (global.ownNumb) {
                try {
                     const ownerJid = `${global.ownNumb}@s.whatsapp.net`;
                     await Fastbyte.sendMessage(ownerJid, {
                         text: `*🚨 ERROR IN MESSAGES.UPSERT*:\n\n${util.format(err)}`,
                     });
                 } catch (ownerErr) {
                     console.error(chalk.redBright("Failed to send upsert error report to owner:"), ownerErr);
                 }
             }
        }
    });

    Fastbyte.ev.process(
        async (events) => {
            if (events['presence.update']) {
                 // await Fastbyte.sendPresenceUpdate('available'); // Can be enabled if needed
            }
            if (events['messages.update']) {
                 // Future handling for edits, reactions etc.
            }
            if (events['creds.update']) {
                await saveCreds();
            }
        }
    )

    return Fastbyte
}

FastbyteStart().catch(err => console.error("Error starting Fastbyte:", err));

let file = require.resolve(__filename);
fs.watchFile(file, () => {
    fs.unwatchFile(file);
    console.log(chalk.yellowBright(`🔄 File Updated: ${__filename}. Restarting...`));
    delete require.cache[file];
    process.exit(1);
});