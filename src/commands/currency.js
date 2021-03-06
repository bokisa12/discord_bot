import ChatCommand from '../ChatCommand';
import CurrencyUser from '../CurrencyUser';
import CVL from '../leaderboard';
import r_handler from '../utils/reject_handler';

const cmd_makeBankAcc = new ChatCommand('makeBankAcc', msg => {
	CurrencyUser.create(msg.author.username, {msg}).then(() => msg.reply(`Your new bank account has been credited with **$${CurrencyUser.defaults.startingBal}.** You can check your balance by running **!bal**.`))
	.catch(r_handler);
}, {
	aliases: ['mba']
});

const cmd_bal = new ChatCommand('bal', msg => {
	new CurrencyUser(msg.author.username).bal('GET', null, {msg}).then(bal => msg.reply(`Your current balance is **$${bal}**.`)).catch(r_handler);
});

const cmd_pay = new ChatCommand('pay', (msg, args) => {
	let [receiver, amount] = args;

	new CurrencyUser(msg.author.username).transferBalance(receiver, amount, {msg}).then(() => msg.reply(`You successfully transfered **$${amount}** to **${receiver}**.`)).catch(r_handler);
}, {
	usage: '!pay <user> <amount>',
	requiredParams: 2
});

const cmd_leaderboard = new ChatCommand('leaderboard', msg => {
	CVL({msg}).then(leaderboard => msg.channel.sendMessage(leaderboard)).catch(r_handler);
}, {
	aliases: ['lb']
});

export default [cmd_makeBankAcc, cmd_bal, cmd_leaderboard, cmd_pay];