import {User, Character, Audit, Equipment, Init, sequelize} from './tables_modules.js';
import { Sequelize, DataTypes, Model } from 'sequelize';
import { Markup, Telegraf } from 'telegraf';
import dotenv from 'dotenv';
dotenv.config();

const token = process.env.TOKEN;

const bot = new Telegraf(token);

async function connect(){
try {
    await sequelize.authenticate();
    console.log('Соединение с БД было успешно установлено');
  } catch (e) {
    console.log('Невозможно выполнить подключение к БД: ', e);
  };
}

connect();

Init();

async function forceSyncTables(){
  await sequelize.sync({force:true});
};

async function syncTables(){
  await sequelize.sync();
};

const charactersList = [ 'Бруно', 'Амир', 'Корочка', 'Хан' ];
const charactersList2 = [ 'Хельга'];
const crutch = [];

async function fillChars(){
  for (let i in charactersList2){
    const character = await Character.create({ Name: charactersList2[i]});
    console.log(character);
  }
}

async function checkChat(chat){
  let user = await User.findAll({where:{ChatId:chat}});
  if (user.length === 0 || user === undefined) {
    console.log('user empty');
    console.log(user.length);
    return true;
  }
  else{
    const t = await Character.findAll({where: {Id:user[0].getDataValue('CharacterId')}});
    console.log(user);
    bot.telegram.sendMessage(chat, `Привет, ${t[0].getDataValue('Name')}!`);
    return false;
  }  
}


async function authenticate(chat, character){
  let user = await User.findAll({where:{ChatId:chat}});
  console.log(user);
  if (user.length === 0) 
     {
      let char = await Character.findAll({where:{Name:character}});
      await console.log(char);
      if (char.length === 0) 
        bot.telegram.sendMessage(chat, 'Извини, такого персонажа в списке нет( Нажми /start и попробуй ввести имя ещё раз');
      else {
        bot.telegram.sendMessage(chat, `Привет, ${char[0].getDataValue('Name')}!`);
        user = await User.create({ChatId: chat, CharacterId: char[0].getDataValue('Id')});
        console.log(user);
      }
    }
  else {
    const char = await Character.findAll({where:{Id:user[0].getDataValue('CharacterId')}}); 
    bot.telegram.sendMessage(chat, `Вы уже вошли как персонаж ${char[0].getDataValue('Name')}`);
  }
};

async function get_balance(chat_id){
  const user = await User.findAll({where:{ChatId:chat_id}});
  const charId = await user[0].getDataValue('CharacterId');
  const char = await Character.findAll({where:{Id:charId}});
  return await char[0].getDataValue('Money');
}

//fillChars();
//forceSyncTables();
//syncTables();

bot.start(async msg => {
        const chatId = msg.chat.id;
        const t = await checkChat(chatId);
        if (t){
          crutch.push([msg.chat.id, 'new user']);
          bot.telegram.sendMessage(chatId, 'Привет, напиши имя своего персонажа');
        }
         
});

bot.command('add', async (msg) => {
  bot.telegram.sendMessage(msg.chat.id, 'Что добавим в инвентарь? Напишите название, через пробел количество и ещё через пробел стоимость товара');
  crutch.push([msg.chat.id, 'add']);
  console.log(crutch);
});

bot.command('buy', async (msg) => {
  bot.telegram.sendMessage(msg.chat.id, 'Что купим? Напишите название, через пробел количество и ещё через пробел стоимость товара');
  crutch.push([msg.chat.id, 'add']);
  console.log(crutch);
});

bot.command('get_money', async (msg) => {
  bot.telegram.sendMessage(msg.chat.id, 'Сколько деняк приобрели?');
  crutch.push([msg.chat.id, 'get money']);
  console.log(crutch);
});

bot.command('spend_money', async (msg) => {
  bot.telegram.sendMessage(msg.chat.id, 'Сколько деняк потратили?');
  crutch.push([msg.chat.id, 'spend money']);
  console.log(crutch);
});

bot.command('give_to', async (msg) => {
  // let buttons = [Markup.button.callback('деньги','money'), Markup.button.callback('штуки','item')];
  let keyboard = Markup.inlineKeyboard([Markup.button.callback('деньги','money'), Markup.button.callback('штуки','item')]);
  //const keyboard = Keyboard.make([Key.callback('деньги','money'), Key.callback('штуки','item')]).inline();
  bot.telegram.sendMessage(msg.chat.id, 'Делимся деньгами или вещами из инвентаря?', keyboard);
});

bot.on('money'), (msg) => {
  return msg.answerCbQuery('ok');
}

bot.on('item'), (msg) => {
  bot.telegram.sendMessage(msg.chat.id, 'no ok');
}

bot.command('balance', async (msg) => {
  const balance = await get_balance(msg.chat.id);
  bot.telegram.sendMessage(msg.chat.id, `${balance}`);
});

bot.on('text', async msg => {

  if (crutch.length === 0){
    bot.telegram.sendMessage(msg.chat.id, 'Ой, я не знаю к чему это, но на всякий случай спасибо');
  }
  else {
    console.log(crutch);
  for (let t in crutch){
    console.log(crutch[t]);

    if (crutch.length !== 0 && crutch[t][0] == msg.chat.id && crutch[t][1]=='add'){
      bot.telegram.sendMessage(msg.chat.id, msg.message.text);
      await crutch.pop(t);
      console.log(crutch);
    }

    if (crutch.length !== 0 && crutch[t][0] == msg.chat.id && crutch[t][1]=='new user'){
      await authenticate(msg.chat.id, msg.message.text);
      crutch.pop(t);
      console.log(crutch);
    }

    const user = await User.findAll({where:{ChatId:msg.chat.id}});
    const charId = await user[0].getDataValue('CharacterId');
    const char = await Character.findAll({where:{Id:charId}});
    const money = await char[0].getDataValue('Money');

    if (crutch.length !== 0 && crutch[t][0] == msg.chat.id && crutch[t][1]=='get money'){
      const newMoney = money+msg.message.text;
      await Character.update({Money: newMoney}, {where: {Id:charId}});
      crutch.pop(t);
      console.log(crutch);
    }

    if (crutch.length !== 0 && crutch[t][0] == msg.chat.id && crutch[t][1]=='spend money'){
      const newMoney = money-msg.message.text;
      if (newMoney<0) bot.telegram.sendMessage(msg.chat.id, 'У вас недостаточно средств на карте для выполнения этой операции ьуь');
      else{
        await Character.update({Money: newMoney}, {where: {Id:charId}});
        bot.telegram.sendMessage(msg.chat.id, 'Успешно');
      }
      crutch.pop(t);
      console.log(crutch);
    }


  }
}
});

bot.launch();