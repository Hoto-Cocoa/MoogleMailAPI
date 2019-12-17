# MoogleMailAPI
The API of Moogle Mail that is mail system of HentaiVerse, that implemented using WebSocket. 

# Installation
1. Clone this repository, or download archive.
1. `npm i` to install dependencies.

# Configuration
Save configuration to `config.json` with below format.
```json
{
	"Server": {
		"Port": 80,
		"NewMailInterval": 10000
	}
}
```

# Development
You can use `test/auth.js` to test client connection. Before using, Please add HentaiVerse Cookie to `Test.Auth` at `config.json`.

After configure, you can use test client by exec `node test/auth`.

# Documentation
## Authorization
This API server need authorize, by websocket message. You have to send data with below format when connection.
```js
{ type: 'authorize', data: { value: 'ipb_member_id=memberId; ipb_pass_hash=passHash' } }
```
If API server successfully logged in, API server will return below data.
```js
{ type: 'authorizeResult', value: { success: true } }
```
If API can't log in to HentaiVerse with your cookies, API server will return below data.
```js
{ type: 'authorizeResult', value: { success: false, type: 'InvalidAuthData' } }
```

## Get new mails
This server send new mails at every 10 seconds(or your setting value), In below format.
```js
[ {
	id: 12345, // MID
    from: 'Sender',
    subject: 'Subject of Mail',
	date: 0 // Send date of Mail
} ]
```
If your account doesn't have new mail, server will not send any data.
