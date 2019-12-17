const { JSDOM } = require('jsdom');
const jquery = require('jquery');

module.exports = class MoogleMail {
	getNewMailList(mailHtml) {
		let list = [];
		const $ = jquery(new JSDOM(mailHtml).window), mailList = $('tbody > tr[onclick]').toArray();
		mailList.forEach(e => {
			const children = [...e.children];
			list.push({ id: Number($(e).attr('onclick').match(/document\.location='https:\/\/hentaiverse\.org\/\?s=Bazaar&ss=mm&filter=inbox&mid=([0-9]*?)'/)[1]), from: children.shift().innerHTML, subject: children.shift().innerHTML, date: new Date(children.shift().innerHTML).getTime() });
		});
		return list;
	}

	getMail(mailId) {

	}
}
