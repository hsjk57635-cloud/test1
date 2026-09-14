'use strict';
const axios = require('axios');
const fs    = require('fs');

async function getBuffer(url, opts = {}) {
  const { data } = await axios.get(url, { responseType: 'arraybuffer', timeout: 30000, ...opts });
  return Buffer.from(data);
}
async function fetchJson(url, opts = {}) {
  const { data } = await axios.get(url, { timeout: 15000, ...opts });
  return data;
}
function formatRuntime(ms) {
  const s=Math.floor(ms/1000),h=Math.floor(s/3600),m=Math.floor((s%3600)/60),sc=s%60;
  return `${h}h ${m}m ${sc}s`;
}
function formatBytes(b) {
  if(b<1024)return b+' B';if(b<1048576)return(b/1024).toFixed(1)+' KB';
  if(b<1073741824)return(b/1048576).toFixed(1)+' MB';return(b/1073741824).toFixed(1)+' GB';
}
const sleep = ms => new Promise(r => setTimeout(r, ms));
function getBody(msg) {
  return msg.message?.conversation||msg.message?.extendedTextMessage?.text||msg.message?.imageMessage?.caption||msg.message?.videoMessage?.caption||'';
}
function getQuoted(msg) {
  const ctx=msg.message?.extendedTextMessage?.contextInfo;
  if(!ctx?.quotedMessage) return null;
  return {message:{key:{remoteJid:ctx.participant||ctx.stanzaId,id:ctx.stanzaId,fromMe:false},message:ctx.quotedMessage},sender:ctx.participant,stanzaId:ctx.stanzaId};
}
function getMentioned(msg) {
  return msg.message?.extendedTextMessage?.contextInfo?.mentionedJid||[];
}
async function isAdmin(conn, from, jid) {
  try { const meta=await conn.groupMetadata(from); const p=meta.participants.find(p=>p.id===jid); return p?.admin==='admin'||p?.admin==='superadmin'; } catch { return false; }
}
async function getAdmins(conn, from) {
  try { const meta=await conn.groupMetadata(from); return meta.participants.filter(p=>p.admin).map(p=>p.id); } catch { return []; }
}
function checkOwner(sNum, ownerNum, coNum) { return sNum===ownerNum||sNum===coNum; }
const pick    = arr => arr[Math.floor(Math.random()*arr.length)];
const randInt = (min,max) => Math.floor(Math.random()*(max-min+1))+min;
const clean   = s => String(s||'').replace(/[<>]/g,'');
const exists  = p => fs.existsSync(p);
function nlCtx(botName,nlJid,botImg,repo){return{forwardingScore:999,isForwarded:true,forwardedNewsletterMessageInfo:{newsletterJid:nlJid||'120363408055942569@newsletter',newsletterName:'JUNAID-MD↣³⁰²',serverMessageId:-1},externalAdReply:{title:botName||'🔥 REDXBOT302 🔥',body:'Owner: JUNAID-MD↣³⁰²',thumbnailUrl:botImg||'https://files.catbox.moe/s36b12.jpg',sourceUrl:repo||'https://github.com/AbdulRehman19721986/REDXBOT-MD',mediaType:1,renderLargerThumbnail:false}};}
async function react(conn,msg,emoji){try{await conn.sendMessage(msg.key.remoteJid,{react:{text:emoji,key:msg.key}});}catch{}}
async function downloadQuotedMedia(conn,msg){
  const {downloadContentFromMessage}=require('@whiskeysockets/baileys');
  const ctx=msg.message?.extendedTextMessage?.contextInfo;
  if(!ctx?.quotedMessage)return null;
  const qm=ctx.quotedMessage;
  let mediaNode=null,mediaType=null;
  if(qm.imageMessage){mediaNode=qm.imageMessage;mediaType='image';}
  else if(qm.videoMessage){mediaNode=qm.videoMessage;mediaType='video';}
  else if(qm.audioMessage){mediaNode=qm.audioMessage;mediaType='audio';}
  else if(qm.documentMessage){mediaNode=qm.documentMessage;mediaType='document';}
  else if(qm.stickerMessage){mediaNode=qm.stickerMessage;mediaType='sticker';}
  if(!mediaNode)return null;
  const stream=await downloadContentFromMessage(mediaNode,mediaType);
  let buf=Buffer.from([]);
  for await(const c of stream)buf=Buffer.concat([buf,c]);
  return{buffer:buf,type:mediaType,node:mediaNode};
}
module.exports={getBuffer,fetchJson,formatRuntime,formatBytes,sleep,getBody,getQuoted,getMentioned,isAdmin,checkOwner,getAdmins,pick,randInt,clean,exists,nlCtx,react,downloadQuotedMedia,isOwner:checkOwner};
