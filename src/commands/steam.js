import r_handler from '../utils/reject_handler';
import ChatCommand from '../ChatCommand';
import fetch from 'node-fetch';
import CurrencyUser from '../CurrencyUser';

const {steam_api_key} = require('../bot_config.json');

let cmd_steam = undefined;

if(steam_api_key != null) {
	cmd_steam = new ChatCommand('steam', function(msg, args) {
		const currentUser = new CurrencyUser(msg.author.username);	
		let [subCmd, arg1] = args;
		currentUser.exists({msg}).then(() => {
			switch(subCmd) {
				case 'gethours': 
					if(!arg1) {
						return Promise.reject({msg, u: this.usageString});
					}

					return getSteamIDbyUsername(arg1, {msg}).then(id => {
						return fetch(`https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${steam_api_key}&steamid=${id}&include_appinfo=1`)
						.then(res => {
							if(res.ok) {
								return res.json();
							}
							return Promise.reject({msg, u: 'There was an error while processing your request.'});
						}).then(data => {
							let final = `\n\n**${arg1}** owns **${data.response.game_count}** games:\n\n`;
							data.response.games.forEach((game, i, arr) => {
								let toAttach = `**${game.name}**: ${(game.playtime_forever / 60).toFixed(1)} hours`;
								if(i !== arr.length - 1) {
									toAttach += '\n';
								}
								final += toAttach;
							});
							if(final.length > 2000) {
								console.log(`Message is over 2000 characters long!: ${final.length}`);
								let individual = final.split('\n').map((line, i, arr) => i !== arr.length - 1 ? line + '\n' : line),
									breakpoint,
									msg1 = '',
									msg2 = '';
								individual.forEach((line, i, arr) => {
									if((msg1.length + line.length) > 2000) {
										return breakpoint = i;
									}
									msg1 += line;	
								});
								console.log(breakpoint);
								for(;breakpoint < individual.length; breakpoint++) {
									msg2 += individual[breakpoint];
								}
								console.log(msg1.length, msg2.length);
								return msg.reply(msg2);
							}
							console.log('Returning regular final message!');

							return msg.reply(final);

						});
					});

					break;	
				default: 
					return Promise.reject({msg, u: this.usageString});
			}
		}).catch(r_handler); 
	}, {
		requiredParams: 1,
		usage: ['!steam gethours <username>'],
		aliases: ['st']
	})
}

export default [cmd_steam];

function getSteamIDbyUsername(username, rejObj) {
	return fetch(`https://api.steampowered.com/ISteamUser/ResolveVanityURL/v1/?key=${steam_api_key}&vanityurl=${username}`).
	then(res => res.json()).then(data => {
		if(data.response.success !== 1 || !data.response.steamid) {
			return Promise.reject(Object.assign({
				u: `The user **${username}** doesn't exist on Steam.`
			}, rejObj));
		}
		return Promise.resolve(data.response.steamid);
	});
}

