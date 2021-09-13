/**
 * @name Apate
 * @version 1.2.11
 * @description Hide your secret Discord messages in other messages!
 * @author TheGreenPig, Kehto, Aster
 * @source https://github.com/TheGreenPig/Apate/blob/main/Apate.plugin.js
 * @updateUrl https://raw.githubusercontent.com/TheGreenPig/Apate/main/Apate.plugin.js
 * @authorLink https://github.com/TheGreenPig
 */

/* 
 * BetterDiscord BdApi documentation:
 *   https://github.com/BetterDiscord/BetterDiscord/wiki/Creating-Plugins
 * 
 * BetterDiscord file structure documentation:
 *   https://github.com/BetterDiscord/documentation/blob/main/plugins/file_structure.md
 *  
 * Zere's Plugin Library documentation:
 * 	 https://rauenzi.github.io/BDPluginLibrary/docs/
 */

module.exports = (() => {
	const config = {
		info: {
			name: "Apate",
			authors: [{
				name: "AGreenPig",
				discord_id: "427179231164760066",
				github_username: "TheGreenPig"
			},
			{
				name: "Kehto",
				discord_id: "517142662231359488",
				github_username: "fabJunior",
			},
			{
				name: "Aster",
				discord_id: "534335982200291328",
				github_username: "BenjaminAster",
				website: "https://benjaminaster.com/"
			},


			],
			version: "1.2.11",
			description: "Apate lets you hide messages in other messages! - Usage: `cover message \*hidden message\*`",
			github_raw: "https://raw.githubusercontent.com/TheGreenPig/Apate/main/Apate.plugin.js",
			github: "https://github.com/TheGreenPig/Apate"
		},
		changelog: [
			{
				title: "Added features:",
				type: "added",
				items: [
					"Shift Click for no encryption.",
					"Added Key position option.",
					"Added Alt+Control+Enter shortcut to choose the password.",
				]
			},
			{
				title: "Fixed:",
				type: "fixed",
				items: [
					"Key doesn't get displayed in channels where you cant write.",
				]
			},
		],
	};
	class HTMLWrapper extends BdApi.React.Component {
		componentDidMount() {
			this.refs.element.appendChild(this.props.children);
		}

		render() {
			return BdApi.React.createElement("div", {
				className: "react-wrapper",
				ref: "element"
			});
		}
	}


	return !global.ZeresPluginLibrary ? class {
		load() {
			BdApi.showConfirmationModal("Library Missing", `The library plugin needed for ${config.info.name} is missing. Please click Download Now to install it.`, {
				confirmText: "Download Now",
				cancelText: "Cancel",
				onConfirm: async () => {
					const zeresPluginLib = await (await globalThis.fetch("https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js")).text();

					await new Promise(
						resolve => require("fs").writeFile(
							require("path").join(BdApi.Plugins.folder, "0PluginLibrary.plugin.js"),
							zeresPluginLib,
							resolve,
						),
					);
				},
			});
		};
	} : (([Plugin, Api]) => {
		const plugin = (Plugin, Api) => {
			const Dispatcher = BdApi.findModuleByProps("dirtyDispatch");

			class ApateMessage extends BdApi.React.Component {
				state = { processing: true, message: undefined, usedPassword: undefined, images: [] }

				componentDidMount() {
					const handleUpdate = state => {
						if (state.id !== this.props.message.id) {
							return
						}

						this.props.message.apateHiddenMessage = state.message === undefined ? null : state.message;

						this.setState({ processing: false, message: state.message, usedPassword: state.password });
					};

					Dispatcher.subscribe("APATE_MESSAGE_REVEALED", handleUpdate);

					if (this.props.message.apateHiddenMessage !== undefined) {
						return this.setState({ processing: false, message: this.props.message.apateHiddenMessage, });
					}

					this.props.apate.revealWorkers[this.props.apate.lastWorkerId]?.postMessage({
						channelId: this.props.message.channel_id,
						id: this.props.message.id,
						reveal: true,
						stegCloakedMsg: this.props.message.content.replace(/^\u200b/, ""),
						passwords: this.props.apate.settings.passwords,
					});

					this.props.apate.lastWorkerId++;
					this.props.apate.lastWorkerId %= this.props.apate.numOfWorkers;
				}

				handleOnClick() {
					if (this.props.apate.settings.showInfo) {
						let passwordIndex = this.props.apate.settings.passwords.indexOf(this.state.usedPassword);
						let color = this.props.apate.settings.passwordColorTable[passwordIndex];

						if (passwordIndex > 1) {
							this.props.apate.settings.passwords.splice(passwordIndex, 1);
							this.props.apate.settings.passwordColorTable.splice(passwordIndex, 1);

							this.props.apate.settings.passwords.splice(1, 0, this.state.usedPassword);
							this.props.apate.settings.passwordColorTable.splice(1, 0, color);
							this.props.apate.saveSettings(this.props.apate.settings);
						}

						let style = "";

						if (this.state.usedPassword === "") {
							//data.usedPswd = "-No Encryption-"
							passwordIndex = "-No Encryption-"
							style = `style="font-style: italic; font-size:1em;"`;
						} else {
							style = `style="color:${color}; font-size:0.9em;"`;

							var copyButton = document.createElement("button");
							copyButton.innerHTML = `📋`
							copyButton.classList.add("btn-passwords");
							copyButton.setAttribute("title", "Copy Password")
							copyButton.addEventListener("click", () => {
								navigator.clipboard.writeText(this.state.usedPassword);
								BdApi.showToast("Copied password!", { type: "success" });
							});
						}

						let htmlText = document.createElement("div");
						htmlText.innerHTML = `Password used: <b><div ${style}>${this.state.usedPassword || "-No Encryption-"}</div></b>`;
						htmlText.className = "markup-2BOw-j messageContent-2qWWxC";
						if (copyButton) {
							htmlText.querySelector("div").appendChild(copyButton);
						}

						BdApi.alert("Info", BdApi.React.createElement(HTMLWrapper, null, htmlText));
					}
				}

				formatHiddenMessage() {
					let urlRegex = /(https?:\/\/)[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_+.~#?&/=\[\]]*)/g;
					let emojiRegex = /\[[a-zA-Z_~\d+-ñ]+?:(\d+\.(png|gif)|default)\]/g; // +-ñ are for 3 discord default emojis (ñ for "piñata", + for "+1" and - for "-1")

					if (this.state.message == null) {
						return "";
					}

					let children = [this.state.message];

					for (let i = children.length - 1; i >= 0; i--) {
						let child = children[i];
						if (typeof(child) !== "string") continue;

						while (child.lastIndexOf("\\n") >= 0) {
							let before = child.slice(0, child.lastIndexOf("\\n"));
							let after = child.slice(child.lastIndexOf("\\n") + "\\n".length);

							children.splice(i, 1, ...[before, BdApi.React.createElement("br"), after].filter(x => typeof(x) !== "string" || x.trim().length));
							child = before;
						}
					}

					if (urlRegex.test(this.state.message)) {
						const AnchorClasses = BdApi.findModule(m => m.anchorUnderlineOnHover);
						let nbLinksScanned = 0;

						for (let i = 0; i < children.length; i++) {
							let child = children[i];
							if (typeof(child) !== "string") continue;

							let linkArray = child.match(urlRegex);

							if (!linkArray) continue;

							for (let j = 0; j < linkArray.length; j++) {
								let link = BdApi.React.createElement("a", {
									className: `${AnchorClasses.anchor} ${AnchorClasses.anchorUnderlineOnHover}`,
									title: linkArray[j],
									href: linkArray[j],
									rel: "noreferrer noopener",
									target: "_blank",
									role: "button",
									tabindex: 0 }, linkArray[j]);

								let before = child.slice(0, child.indexOf(linkArray[j]));
								let after = child.slice(child.indexOf(linkArray[j]) + linkArray[j].length);

								children.splice(children.indexOf(child), 1, ...[before, link, after].filter(x => typeof(x) !== "string" || x.trim().length));
								child = after || "";
							}
						}

						for (let i = children.length - 1; i >= 0; i--) {
							let child = children[i];
							if (child?.type !== "a") continue;

							if (this.props.apate.settings.displayImage && nbLinksScanned < 3) { //only scan the first 3 links
								nbLinksScanned++;
								//Message has image link
								let imageLink = new URL(child.props.href);

								let url;
								if (imageLink.hostname.endsWith("discordapp.net") || imageLink.hostname.endsWith("discordapp.com")) {
									url = imageLink.href;
								} else {
									url = `https://images.weserv.nl/?url=${encodeURIComponent(imageLink.href)}&n=-1`
								}

								if (this.state.images[imageLink.href] !== undefined) {
									if (this.state.images[imageLink.href]) {
										let linkIdx = children.indexOf(child);

										let isBrBefore = children[linkIdx - 1]?.type === "br";
										let isBrAfter = children[linkIdx + 1]?.type === "br";

										// If there is a new line before and after the link, then we remove one of them to avoid having an empty line
										// we also remove on if there is a new line after the link which is the first child OR a new line before the link which is the last child
										if ((isBrBefore && isBrAfter) || (isBrAfter && linkIdx === 0)) {
											children.splice(linkIdx, 2);
										} else if (isBrBefore && linkIdx === children.length - 1) {
											children.splice(linkIdx - 1, 2);
										} else {
											children.splice(linkIdx, 1);
										}

										let img = BdApi.React.createElement("img", { className: "apateHiddenImg", src: url })
										children.push(img);
									}
								} else {
									this.props.apate.testImage(url).then(() => {
										let newImages = {...this.state.images};
										newImages[imageLink.href] = true;

										this.setState({ images: newImages });
									}).catch(() => {
										let newImages = {...this.state.images};
										newImages[imageLink.href] = false;

										this.setState({ images: newImages });
									});
								}
							}
						}
					}

					// Stitches together all pieces of texts
					children = children.reduce((array, curr) => {
						if (typeof(array[array.length -1]) === "string" && typeof(curr) === "string") {
							array[array.length - 1] += curr;
						} else {
							array.push(curr);
						}

						return array;
					}, []);

					if (emojiRegex.test(this.state.message)) {
						const discordEmojiModule = BdApi.findModule(m => m.Emoji && m.default.getByName).default;
						const emojiContainerClass = BdApi.findModule(m => Object.keys(m).length === 1 && m.emojiContainer).emojiContainer;

						for (let i = 0; i < children.length; i++) {
							let child = children[i];
							if (typeof(child) !== "string") continue;

							let emojiArray = child.match(emojiRegex);

							if (!emojiArray) continue;

							let bigEmoji = null;

							let rest = child.replace(emojiRegex, "").trim().replace("\u200B", "");
							if (rest.length === 0) {
								bigEmoji = "jumboable"
							}

							for (let j = 0; j < emojiArray.length; ++j) {
								let [emojiName, emojiId] = emojiArray[j].slice(1, emojiArray[j].length - 1).split(":");

								let src;
								if (emojiId === "default") {
									src = discordEmojiModule.getByName(emojiName).url;
								} else {
									if (!this.props.apate.settings.animate) {
										emojiId = emojiId.replace(".gif", ".png")
									}

									src = `https://cdn.discordapp.com/emojis/${emojiId}?v=1`;
								}

								let img = BdApi.React.createElement("img", { className: `emoji ${bigEmoji}`, "aria-label": emojiName, alt: emojiName, src });
								let emojiContainer = BdApi.React.createElement("span", { className: emojiContainerClass, tabindex: 0 }, img);

								let before = child.slice(0, child.indexOf(emojiArray[j]));
								let after = child.slice(child.indexOf(emojiArray[j]) + emojiArray[j].length);

								children.splice(children.indexOf(child), 1, ...[before, emojiContainer, after].filter(x => typeof(x) !== "string" || x.length));
								child = after || "";
							}
						}
					}

					return children;
				}

				render() {
					return this.state.message === null ?
						null :
						BdApi.React.createElement("div",
							{ className: `apateHiddenMessage ${ this.state.processing ? "loading" : "" }`, onClick: this.handleOnClick.bind(this) },
							this.formatHiddenMessage()
						);
				}
			}

			let apateCSS = [
				`.apateKeyButtonContainer {`,
				`	display: flex;`,
				`	justify-content: center;`,
				`	align-items: center;`,
				`}`,
				`.apateEncryptionKeyButton {`,
				`	transition: all 300ms ease;`,
				`	overflow: hidden;`,
				`	font-size: 1rem;`,
				`	display: flex;`,
				`	justify-content: center;`,
				`	align-items: center;`,
				`	clip-path: inset(0);`,
				`	width: 3em;`,
				`	height: 2.8em;`,
				`}`,
				`.apateEncryptionKeyContainer {`,
				`	padding: 0;`,
				`	width: 5rem;`,
				`	height: 5rem;`,
				`}`,
				`.apateEncryptionKey {`,
				`	transition: all 300ms ease;`,
				`	font-size: 1.3rem;`,
				`	width: 2em;`,
				`	height: 2em;`,
				`}`,
				`.apateHiddenImg {`,
				`	margin: 10px;`,
				`	border-radius: 0.3em;`,
				`	max-width: 500px;`,
				`	max-height: 400px;`,
				`	display: block;`,
				`}`,
				`@keyframes apateRotate {`,
				`	0%   { transform: rotate(0deg);   }`,
				`	100% { transform: rotate(360deg); }`,
				`}`,
				`.apateHiddenMessage {`,
				`	border: 2px solid var(--interactive-muted);`,
				`	color: var(--text-normal);`,
				`	padding: 0.4em 0.5em;`,
				`	line-height: normal;`,
				`	margin: .3em 0;`,
				`	width: fit-content;`,
				`	border-radius: 0 .8em .8em .8em;`,
				`	max-width: 100%;`,
				`	box-sizing: border-box;`,
				`	background-image: `,
				`		repeating-linear-gradient(-45deg, `,
				`		var(--background-tertiary) 0em, `,
				`		var(--background-tertiary) 1em, `,
				`		var(--background-floating) 1em, `,
				`		var(--background-floating) 2em);`,
				`}`,
				`.apateHiddenMessage.loading {`,
				`	font-style: italic;`,
				`	color: var(--text-muted);`,
				`}`,
				`.apateHiddenMessage.loading::after {`,
				`	content: "[loading hidden message...]";`,
				`	animation: changeLetter 1s linear infinite;`,
				`}`,
				`.apateAboutMeHidden {`,
				`	max-width: 90%;`,
				`	font-size: 14px;`,
				`	margin-top: -0.6rem;`,
				`	margin-bottom: 0.6rem;`,
				`}`,
			].join("\n");

			let apateLeftKeyCSS = [
				`.apateKeyButtonContainer {`,
				`	margin-left: -0.6rem;`,
				`	margin-right: 0.1rem;`,
				`}`,
			].join("\n");

			let apateNoLoadingCSS = [
				`.apateHiddenMessage.loading {`,
				`	display: none;`,
				`}`,
				`.apateHiddenMessage.loading::after {`,
				`display: none;`,
				`}`,
			].join("\n")

			let apatePasswordCSS = [
				`.form-control{`,
				`	margin-bottom: 10px;`,
				`}`,
				`.btn-add{`,
				`	background-color: rgb(12, 187, 50);`,
				`	font-size: 1em;`,
				`	color: white;`,
				`	padding: 0.3em;`,
				`	border-radius: .25rem;`,
				`}`,
				`.downloadListButton{`,
				`	background-color: Teal;`,
				`	color: white;`,
				`	padding: 0.3em;`,
				`	font-size: 1em;`,
				`	margin-bottom: 10px;`,
				`	border-radius: .25rem;`,
				`}`,
				`.uploadListButton{`,
				`	background-color: Teal;`,
				`	color: white;`,
				`	padding: 0.3em;`,
				`	font-size: 1em;`,
				`	margin-bottom: 10px;`,
				`	border-radius: .25rem;`,
				`}`,
				`.btn-passwords{`,
				`	font-size: 1.3em;`,
				`	padding: 0em;`,
				`	background-color: transparent;`,
				`}`,
				`.dynamic-list{`,
				`	display: flex;`,
				`	-ms-flex-direction: column;`,
				`	flex-direction: column;`,
				`	padding-left: 0;`,
				`	margin-bottom: 0;`,
				`}`,
				`.passwordLi{`,
				`	width: fit-content;`,
				`	text-align: left;`,
				`	font-weight: bold;`,
				`	padding: 0.4em 0.5em;`,
				`	line-height: normal;`,
				`	margin-bottom: 10px;`,
				`	background-color: #000;`,
				`	border: 1px solid`,
				`	rgba(0,0,0,.125);`,
				`	border-top-left-radius: .25rem;`,
				`	border-top-right-radius: .25rem;`,
				`	border-bottom-left-radius: .25rem;`,
				`	border-bottom-right-radius: .25rem;`,
				`}`,
				`.ownPassword{`,
				`	color: white;`,
				`	background-color: transparent;`,
				`}`,
				`.selectedPassword{`,
				`	background-color: white;`,
				`}`,
			].join("\n");

			let apateSimpleCSS = [
				`.apateHiddenMessage {`,
				`	background: none;`,
				`}`,
			].join("\n");


			let apateAnimateCSS = [
				`.apateEncryptionKey:hover {`,
				`	font-size: 2em;`,
				`	fill: dodgerBlue;`,
				`	animation: apateRotate 0.5s ease;`,
				`	animation-iteration-count: 1; `,
				`}`,
				`.apateEncryptionKey.calculating {`,
				`	fill: orange;`,
				`	animation: apateRotate 1s linear;`,
				`	animation-direction: reverse;`,
				`	animation-iteration-count: infinite;`,
				`}`,
				`.apateEncryptionKeyButton:hover {`,
				`	width: 4em;`,
				`}`,
				`@keyframes changeLetter {`,
				`	0%   { content: "[loading hidden message]";   }`,
				`	33%  { content: "[loading hidden message.]";  }`,
				`	66%  { content: "[loading hidden message..]"; }`,
				`	100% { content: "[loading hidden message...]";}`,
				`}`,
			].join("\n");

			const colors = [
				"MediumVioletRed",
				"PaleVioletRed",
				"LightPink",
				"Red",
				"IndianRed",
				"OrangeRed",
				"DarkOrange",
				"DarkKhaki",
				"Gold",
				"Yellow",
				"Chocolate",
				"RosyBrown",
				"DarkGreen",
				"ForestGreen",
				"Olive",
				"LimeGreen",
				"MediumSeaGreen",
				"SpringGreen",
				"Chartreuse",
				"Teal",
				"LightSeaGreen",
				"DarkTurquoise",
				"Aquamarine",
				"MediumBlue",
				"DeepSkyBlue",
				"LightBlue",
				"Purple",
				"DarkViolet",
				"Fuchsia",
				"Orchid",
				"Plum",
			];
			const {
				DiscordSelectors,
				Settings,
				Tooltip,
				Logger
			} = { ...Api, ...BdApi };
			const { SettingPanel, SettingGroup, RadioGroup, Switch, Textbox } = Settings;


			const options = [
				{
					name: 'Encryption On',
					desc: 'Your messages will be encrypted.',
					value: 0
				},
				{
					name: 'Encryption Off',
					desc: 'Your messages will NOT be encrypted.',
					value: 1
				}
			];
			const keyPositions = [
				{
					name: 'Right',
					desc: 'The key will be on the right.',
					value: 0
				},
				{
					name: 'Left',
					desc: 'The key will be on the left.',
					value: 1
				},
				{
					name: 'No Key',
					desc: 'The key will be not be displayed',
					value: 2
				}
			];

			const worker = (stegCloakBlobURL) => {
				self.importScripts(stegCloakBlobURL);
				const stegCloak = new StegCloak();
				self.addEventListener("message", (evt) => {
					const data = evt.data;

					if (data.hide) {
						const stegCloakedMsg = (() => {
							try {
								return stegCloak.hide(data.hiddenMsg, data.password, data.coverMsg);
							} catch {
								return;
							}
						})();
						self.postMessage({
							id: data.id,
							hide: true,
							stegCloakedMsg,
						});
					} else if (data.reveal) {
						let usedPassword = "";


						const hiddenMsg = (() => {
							try {
								//\uFFFD = � --> wrong password
								let revealedMessage = "";
								revealedMessage = stegCloak.reveal(data.stegCloakedMsg, data.stegCloakedMsg.replace(data.stegCloakedMsg.replace(/[\u200C\u200D\u2061\u2062\u2063\u2064]*/, ""), ""));

								//check no password
								if (revealedMessage.endsWith("\u200b")) {
									//has indicator character
									return revealedMessage.slice(0, -1);
								}

								//check all other passwords
								for (var i = 0; i < data.passwords.length; i++) {
									revealedMessage = stegCloak.reveal(data.stegCloakedMsg, data.passwords[i]);
									if (revealedMessage.endsWith("\u200b")) {
										//has indicator character
										usedPassword = data.passwords[i];
										return revealedMessage.slice(0, -1);
									}
								}
							} catch {
								return;
							}
						})();

						self.postMessage({
							channelId: data.channelId,
							id: data.id,
							reveal: true,
							password: usedPassword,
							hiddenMsg,
						});
					}
				});
			};

			return class Apate extends Plugin {

				revealWorkers = [];
				hideWorker;
				lastWorkerId = 0;
				numOfWorkers = 16;

				default = {
					encryption: 1,
					deleteInvalid: true,
					ctrlToSend: true,
					animate: true,
					displayImage: true,
					password: "",
					passwords: [],
					passwordColorTable: ['white'],
					showLoading: true,
					showInfo: true,
					saveCurrentPassword: false,
					showChoosePasswordConfirm: true,
					hiddenAboutMe: false,
					hiddenAboutMeText: "",
					keyPosition: 0,
					shiftNoEncryption: true,
					altChoosePassword: true,
					devMode: false
				};
				settings = null;


				addColor() {
					let newColor = colors[Math.floor(Math.random() * colors.length)];
					while (this.settings.passwordColorTable.some(e => e === newColor)) {
						newColor = colors[Math.floor(Math.random() * colors.length)];
					}
					this.settings.passwordColorTable.push(newColor);
				}
				addPasswordFromInput() {
					var candidate = document.getElementById("candidate");
					candidate.value = candidate.value.trim().replace(/[^a-zA-Z0-9\*\.!@#$%^&(){}\[\]:;<>,.?/~_+\-=|\\: ]*/g, "")
					if (this.settings.passwords.indexOf(candidate.value) !== -1) {
						BdApi.alert("Password already in list.", "This password is already in your list!");
						return;
					}
					if (this.settings.passwords.length >= 31) { //we dont count the first one 
						BdApi.alert("Too many passwords.", "You can only have 30 passwords in your list.");
						return;
					}
					if (candidate.value === "") {
						BdApi.alert("Invalid input.", "Please enter a valid password in the Textbox!");
						return;
					}

					this.settings.passwords.push(candidate.value);
					this.saveSettings(this.settings);
					this.updatePasswords();

				}
				addPassword(item) {
					var ul = document.getElementById("dynamic-list");
					var li = document.createElement("li");
					li.setAttribute('id', item);

					var copyButton = document.createElement("button");
					copyButton.textContent = `📋`
					copyButton.classList.add("btn-passwords");
					copyButton.setAttribute("title", "Copy Password")
					copyButton.addEventListener("click", () => {
						navigator.clipboard.writeText(item);
						BdApi.showToast("Copied password!", { type: "success" });
					});

					var revButton = document.createElement("button");
					revButton.textContent = `❌`
					revButton.classList.add("btn-passwords");
					revButton.setAttribute("title", "Remove Password")
					revButton.addEventListener("click", () => this.removePassword(item));

					if (this.settings.passwords[0] === item) {
						//first entry aka own password
						li.classList.add("passwordLi", "ownPassword");
						if (this.settings.encryption === 1) {
							item = "-Encryption is off-";
						}

						li.appendChild(document.createTextNode("Own password: " + item));
						li.appendChild(copyButton);


					} else {
						li.classList.add("passwordLi")
						li.appendChild(document.createTextNode(item));


						li.appendChild(revButton);
						li.appendChild(copyButton);
					}
					let colorLen = this.settings.passwordColorTable.length;
					let passwordLen = this.settings.passwords.length;

					if (colorLen > passwordLen) {
						//need to remove colors
						for (var i = 0; i < colorLen - passwordLen; i++) {
							this.settings.passwordColorTable.pop();
						}
						this.saveSettings(this.settings);
					}
					if (colorLen < passwordLen) {
						//need to add colors
						for (var i = 0; i < passwordLen - colorLen; i++) {
							this.addColor()
						}
						this.saveSettings(this.settings);
					}

					let color = this.settings.passwordColorTable[this.settings.passwords.indexOf(item)]
					li.setAttribute('style', `color:${color}`);
					ul.appendChild(li);
				}
				removePassword(password) {
					if (this.settings.passwords.indexOf(password) !== -1) {
						let index = this.settings.passwords.indexOf(password)
						this.settings.passwords.splice(index, 1);
						this.settings.passwordColorTable.splice(index, 1);
					}
					this.saveSettings(this.settings);
					this.updatePasswords();
				}
				updatePasswords() {
					if (this.settings.passwords[0] !== this.settings.password) {
						if (this.settings.passwords.indexOf(this.settings.password) !== -1) {
							this.removePassword(this.settings.password);
						}
						if (!this.settings.saveCurrentPassword) {
							this.settings.passwords.shift();
						}
						this.settings.passwords.unshift(this.settings.password);
						this.saveSettings(this.settings);
					}
					var ul = document.getElementById("dynamic-list");
					ul.innerHTML = "";
					for (var i = 0; i < this.settings.passwords.length; i++) {
						this.addPassword(this.settings.passwords[i]);
					}
					let download = document.querySelector(".downloadListButton");
					if (download) {
						download.href = `data:application/xml;charset=utf-8,${encodeURIComponent(this.settings.passwords.join("\r\n"))}`;
					}
				}

				refreshCSS() {
					let compact, animate, noLoading, simpleBackground, leftKey, aboutMe;
					animate = noLoading = simpleBackground = leftKey = aboutMe = "";

					let compactClass = BdApi.findModuleByProps("compact", "cozy")?.compact;
					compact = `.${compactClass} .apateHiddenMessage {
						  text-indent: 0;
					}`;
					if (this.settings.animate) {
						animate = apateAnimateCSS;
					}
					if (!this.settings.showLoading) {
						noLoading = apateNoLoadingCSS;
					}
					if (this.settings.simpleBackground) {
						simpleBackground = apateSimpleCSS;
					}
					if (this.settings.keyPosition === 1) {
						leftKey = apateLeftKeyCSS;
					}
					if (!this.settings.hiddenAboutMe) {
						aboutMe = `.apateAboutMeSettings { display: none;}`;
					}
					if (this.settings.encryption === 1) {
						aboutMe = `.apateEncrpytionSettings { display: none;}`;
					}
					BdApi.clearCSS("apateCSS")
					BdApi.injectCSS("apateCSS", apateCSS + compact + animate + simpleBackground + apatePasswordCSS + noLoading + leftKey + aboutMe);
				}

				/**
				 * Tests if the given url is a valid image url
				 * @param  {string}	The url
				 * @param  {int}	Number of milliseconds before returning a timeout error (default 5 000)
				 * @return {string}	Returns "success", "error" or "timeout"
				 */
				testImage(url, timeoutT) {
					return new Promise(function (resolve, reject) {
						var timeout = timeoutT || 5000;
						var timer, img = new Image();
						img.onerror = img.onabort = function () {
							clearTimeout(timer);
							reject("error");
						};
						img.onload = function () {
							clearTimeout(timer);
							resolve("success");
						};
						timer = setTimeout(function () {
							// reset .src to invalid URL so it stops previous
							// loading, but doesn't trigger new load
							img.src = "//!!!!/test.jpg";
							reject("timeout");
						}, timeout);
						img.src = url;
					});
				}

				generatePassword(input) {
					const url = 'https://random-word-api.herokuapp.com/word?number=3';
					fetch(url)
						.then(data => { return data.json() })
						.then(res => {
							var result = res.join("_") + "_"
							var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789*.!@#$%^&(){}[]:;<>.?/~_+-=|\\: ';
							var charactersLength = characters.length;

							var length = Math.random() * (40 - 15) + 15;
							for (var i = 0; i < length; i++) {
								result += characters.charAt(Math.floor(Math.random() * charactersLength));
							}
							input.value = result.substring(0, 50);
							this.settings.password = input.value;
							this.saveSettings(this.settings);
							this.updatePasswords();
						})
				}

				importPasswordList() {
					const fileInput = document.getElementById("file-input");
					if (fileInput.files.length === 0) {
						fileInput.addEventListener("change", fileUploaded, false);
						function fileUploaded() {
							//click again to notify importPasswordList
							document.querySelector(".uploadListButton").click();
							this.value = "";
						}
					}
					else {
						// file was successfully uploaded
						const file = fileInput.files[0];

						var fs = require("fs");
						var importedPasswords = fs.readFileSync(file.path, "utf-8").split("\n");

						BdApi.showConfirmationModal("Import List?", "Your entire password list and your password will be overriden! The first entry of your imported list will become your new password.", {
							confirmText: "Import",
							cancelText: "Cancel",
							danger: true,
							onConfirm: () => {
								let errorPasswords = [];
								if (importedPasswords.length > 31) {
									BdApi.alert("Too many passwords.", `The last ${importedPasswords.length - 31} passwords will not be added into your list.`);
									importedPasswords = importedPasswords.slice(0, 31);
								}
								this.settings.passwords = [];
								this.saveSettings(this.settings);
								for (var i = 0; i < importedPasswords.length; i++) {
									importedPasswords[i] = importedPasswords[i].trim().replace("\r\n", "");
									let correctPassword = importedPasswords[i].replace(/[^a-zA-Z0-9\*\.!@#$%^&(){}\[\]:;<>,.?/~_+\-=|\\: ]*/g, "");
									if (correctPassword !== importedPasswords[i]) {
										errorPasswords.push(importedPasswords[i]);
									}
									else {
										this.settings.passwords.push(importedPasswords[i]);
										this.saveSettings(this.settings);
									}
								}
								this.settings.password = this.settings.passwords[0];
								this.saveSettings(this.settings);
								this.updatePasswords();
								if (errorPasswords.length > 0) {
									BdApi.alert("Some passwords contained errors!", `Passwords: ${errorPasswords.join(", ")}`);
								}
								BdApi.showToast("Passwords imported!", { type: "success" });
							},
						});
					}
				}

				getSettingsPanel() {
					let passwordsGroup = new SettingGroup("Passwords");

					passwordsGroup.getElement().id = "passwordsGroupCollapsed";

					let doc = document.createElement("div");

					doc.innerHTML = ` <div class="input-group">
					 <input type="text" class="inputDefault-_djjkz input-cIJ7To form-control" id="candidate" required placeholder="password1234" maxlength="50">
					 <div class="input-group-append">
					   <button class="btn-add" type="button">Add Password</button>
					   <button class= "downloadListButton" onclick="document.getElementById('file-output').click();">Download Password List</button>
					   <a id="file-output" href="data:application/xml;charset=utf-8,${encodeURIComponent(this.settings.passwords.join("\r\n"))}" download="ApatePasswordList.txt"></a>
					   <button class="uploadListButton" onclick="document.getElementById('file-input').click();">Import Password List</button>
					   <input id="file-input" type="file" name="name" style="display: none;" accept=".txt"/>
 
					 </div>
				   </div>
				   <ul id="dynamic-list">
		   
		   
				   </ul>`;
					let addButton = doc.querySelector(".btn-add");
					let uploadButton = doc.querySelector(".uploadListButton");

					addButton.addEventListener("click", () => this.addPasswordFromInput());
					uploadButton.addEventListener("click", () => this.importPasswordList());




					let text = document.createElement("div");
					text.className = "colorStandard-2KCXvj size14-e6ZScH description-3_Ncsb formText-3fs7AJ modeDefault-3a2Ph1";
					text.textContent = `Here you can manage your passwords. Apate will go through every password and try to use it on a hidden message. 
										 The more passwords are in your list, the longer it will take to display every message. The higher up a password is, the more priority it has.`;

					doc.appendChild(text);
					passwordsGroup.append(doc);
					passwordsGroup.getElement().addEventListener("click", () => this.updatePasswords());


					let encryptionDiv = document.createElement("div");
					encryptionDiv.classList.add("apateEncrpytionSettings")
					let passwordTitle = document.createElement("label");
					passwordTitle.classList = "title-31JmR4";
					passwordTitle.textContent = "Enter password:"

					encryptionDiv.appendChild(passwordTitle);
					encryptionDiv.innerHTML += ` <div class="input-group">
					 <input type="text" class="inputDefault-_djjkz input-cIJ7To form-control" id="candidateOwnPass" required placeholder="password1234" maxlength="50" title="Password">
					 <button class="btn-generate btn-add" type="button">Generate Password</button>
 
 
				   </div>`
					let passwordInput = encryptionDiv.querySelector("input");
					passwordInput.value = this.settings.password;
					passwordInput.addEventListener("change", () => {
						passwordInput.value = passwordInput.value.trim().replace(/[^a-zA-Z0-9\*\.!@#$%^&(){}\[\]:;<>.?/~_+\-=|\\: ]*/g, "");
						this.settings.saveCurrentPassword = false;
						this.settings.password = passwordInput.value;
						this.saveSettings(this.settings);
						this.updatePasswords();
					})

					let passwordSubTitle = document.createElement("div");
					passwordSubTitle.classList = "colorStandard-2KCXvj size14-e6ZScH description-3_Ncsb formText-3fs7AJ marginBottom8-AtZOdT modeDefault-3a2Ph1";
					passwordSubTitle.textContent = "If encryption is turned off this field will be ignored. Only characters a-Z, 0-9, space and special characters(:._, etc.). Tip: Right click the Key, to encrpyt a message with a certian password only once."

					encryptionDiv.appendChild(passwordSubTitle);
					let generateButton = encryptionDiv.querySelector(".btn-generate")
					generateButton.addEventListener("click", () => this.generatePassword(passwordInput));



					let aboutMeDiv = document.createElement("div");
					aboutMeDiv.classList.add("apateAboutMeSettings");
					let aboutMeTitle = document.createElement("label");
					aboutMeTitle.classList = "title-31JmR4";
					aboutMeTitle.textContent = "Hidden About Me Message:"

					let aboutMeSubTitle = document.createElement("div");
					aboutMeSubTitle.classList = "colorStandard-2KCXvj size14-e6ZScH description-3_Ncsb formText-3fs7AJ marginBottom8-AtZOdT modeDefault-3a2Ph1";
					aboutMeSubTitle.textContent = "Choose a message that gets hidden in your About Me page and only Apate users can read."

					aboutMeDiv.appendChild(aboutMeTitle)

					aboutMeDiv.innerHTML += ` <div class="input-group">
					 <input type="text" class="inputDefault-_djjkz input-cIJ7To form-control" required placeholder="Hidden Message!" maxlength="50" title="Hidden About Me message">
				   </div>`

					let aboutMeInput = aboutMeDiv.querySelector("input");

					aboutMeInput.value = this.settings.hiddenAboutMeText;
					aboutMeInput.addEventListener("change", () => {

						this.settings.hiddenAboutMeText = aboutMeInput.value;
						this.saveSettings(this.settings);

						let accountUpdateModule = BdApi.findModuleByProps('setPendingBio');
						let bio = BdApi.findModuleByProps('getCurrentUser').getCurrentUser().bio;

						accountUpdateModule.saveAccountChanges({ bio });
					})

					aboutMeDiv.appendChild(aboutMeSubTitle)


					return SettingPanel.build(() => this.saveSettings(this.settings),
						new Switch('Delete Invalid String', 'All text after the encrypted message will be invalid. Enabling this option will delete all invalid text when attempting to send.', this.settings.deleteInvalid, (i) => {
							this.settings.deleteInvalid = i;
							Logger.log(`Set "deleteInvalid" to ${this.settings.deleteInvalid}`);
						}),
						new Switch('Hidden About Me message', 'Enables you to hide a message in your About Me page', this.settings.hiddenAboutMe, (i) => {
							this.settings.hiddenAboutMe = i;
							Logger.log(`Set "hiddenAboutMe" to ${this.settings.hiddenAboutMe}`);
							this.refreshCSS();
						}),
						aboutMeDiv,
						new SettingGroup('Encryption').append(
							new RadioGroup('', `If encryption is turned on, all messages will be encrypted with the password defined below.`, this.settings.encryption || 0, options, (i) => {
								this.settings.encryption = i;
								Logger.log(`Set "encryption" to ${this.settings.encryption}`);
								this.updatePasswords();
								this.refreshCSS();
							}),
							encryptionDiv,
						),
						passwordsGroup,
						new SettingGroup('Display').append(
							new RadioGroup('Key position', `Choose where and if the key should be displayed. `, this.settings.keyPosition || 0, keyPositions, (i) => {
								this.settings.keyPosition = i;
								if (!this.settings.ctrlToSend && this.settings.keyPosition === 2) {
									BdApi.alert("Can't send messages anymore!", "Since you disabled the key and do not want to use the shortcut either, you will have no way to send messages.");
								}
								Logger.log(`Set "keyPosition" to ${this.settings.keyPosition}`);
								this.refreshCSS();
							}),
							new Switch('Animate', 'Choose whether or not Apate animations are displayed. (Key animation, emoji gif animation etc.)', this.settings.animate, (i) => {
								this.settings.animate = i;
								Logger.log(`Set "animate" to ${this.settings.animate}`);
								this.refreshCSS();
							}),
							new Switch('Simple Background', 'Removes the black background of encrypted messages.', this.settings.simpleBackground, (i) => {
								this.settings.simpleBackground = i;
								Logger.log(`Set "simpleBackground" to ${this.settings.simpleBackground}`);
								this.refreshCSS();
							}),
							new Switch('Display loading message', 'Show [loading hidden message...] whilst Apate checks if the password is correct', this.settings.showLoading, (i) => {
								this.settings.showLoading = i;
								this.refreshCSS();
							}),
							new Switch('Show info on click', 'Lets you click on messages to see the password that was used to decrypt it.', this.settings.showInfo, (i) => {
								this.settings.showInfo = i;
								this.refreshCSS();
							}),
							new Switch('Display Images', 'Links to images will be displayed. All images get displayed by the images.weserv.nl image proxy. Only the first three links will be scanned for an image.', this.settings.displayImage, (i) => {
								this.settings.displayImage = i;
								Logger.log(`Set "displayImage" to ${this.settings.displayImage}`);
							}),
						),
						new SettingGroup('Shortcuts').append(
							new Switch('Control + Enter to send', 'Enables the key combination CTRL+Enter to send your message with encryption. You will have to switch channels for the changes to take effect.', this.settings.ctrlToSend, (i) => {
								this.settings.ctrlToSend = i;
								if (!this.settings.ctrlToSend && this.settings.keyPosition === 2) {
									BdApi.alert("Can't send messages anymore!", "Since you disabled the key and do not want to use the shortcut either, you will have no way to send messages.");
								}
								Logger.log(`Set "ctrlToSend" to ${this.settings.ctrlToSend}`);
							}),
							new Switch('Shift for no encryption', 'If turned on, shift-clicking the Key or sending a message with Ctrl+Shift+Enter will send the message without encryption. You will have to switch channels for the changes to take effect.', this.settings.shiftNoEncryption, (i) => {
								this.settings.shiftNoEncryption = i;
								Logger.log(`Set "shiftNoEncryption" to ${this.settings.shiftNoEncryption}`);
							}),
							new Switch('Alt for choose Password', 'If turned on, you can choose the password you want to use with Ctrl+Alt+Enter. You will have to switch channels for the changes to take effect.', this.settings.altChoosePassword, (i) => {
								this.settings.altChoosePassword = i;
								Logger.log(`Set "altChoosePassword" to ${this.settings.altChoosePassword}`);
							}),
						),
					);
				}
				async onStart() {
					{
						this.settings = this.loadSettings(this.default);

						if (typeof StegCloak === "undefined") {
							let stegCloakScript = document.createElement("script");
							stegCloakScript.src = "https://stegcloak.surge.sh/bundle.js";
							document.head.append(stegCloakScript);
						}

						for (const author of config.info.authors) {
							if (author.discord_id === BdApi.findModuleByProps('getCurrentUser').getCurrentUser()?.id) {
								this.settings.devMode = true;
							}
						}
						if (this.settings.devMode) {
							console.log(
								`%c\u2004\u2004\u2004%c\n%cMade By AGreenPig, Kehto, Aster`,
								'font-size: 130px; background:url(https://raw.githubusercontent.com/TheGreenPig/Apate/main/Assets/logo_dev.svg) no-repeat; background-size: contain;',
								``,
								`color: Orange; font-size: 1em; background-color: black; border: .1em solid white; border-radius: 0.5em; padding: 1em; padding-left: 1.6em; padding-right: 1.6em`,
							);
						}
						else {
							console.log(
								`%c\u2004\u2004\u2004%c\n%cMade By AGreenPig, Kehto, Aster`,
								'font-size: 160px; background:url(https://raw.githubusercontent.com/TheGreenPig/Apate/main/Assets/logo.svg) no-repeat; background-size: contain;',
								``,
								`color: Orange; font-size: 1em; background-color: black; border: .1em solid white; border-radius: 0.5em; padding: 1em; padding-left: 1.6em; padding-right: 1.6em`,
							);
						}

					}

					{
						// Apate CSS
						this.refreshCSS();
					}

					{
						// patches (Aapte key, messages, about me)
						this.patchTextArea();
						this.patchMessages();
						this.patchAboutMe();
					}

					{
						// workers
						const workerCode = worker.toString();

						const stegCloakBlobURL = URL.createObjectURL(new Blob([
							await (await window.fetch("https://raw.githubusercontent.com/KuroLabs/stegcloak/master/dist/stegcloak.min.js")).text()
						]));

						const discordEmojiModule = BdApi.findModule(m => m.Emoji && m.default.getByName).default;
						const emojiContainerClass = BdApi.findModule(m => Object.keys(m).length === 1 && m.emojiContainer).emojiContainer;

						for (let i in [...Array(this.numOfWorkers)]) {
							const worker = new window.Worker(URL.createObjectURL(new Blob(
								[`(${workerCode})(${JSON.stringify(stegCloakBlobURL)});`]
							)));

							worker.addEventListener("message", (evt) => {
								const data = evt.data;

								if (data.reveal) {
									Dispatcher.dispatch({ type: "APATE_MESSAGE_REVEALED", message: data.hiddenMsg === undefined ? null : data.hiddenMsg, password: data.password, id: data.id });
								}
							});

							this.revealWorkers.push(worker);
							URL.revokeObjectURL(worker);
						}

						this.hideWorker = new window.Worker(URL.createObjectURL(new Blob(
							[`(${workerCode})(${JSON.stringify(stegCloakBlobURL)});`]
						)));

						this.hideWorker.addEventListener("message", (evt) => {
							const data = evt.data;
							if (data.hide) {
								let output = "\u200B" + data.stegCloakedMsg;
								const textArea = document.querySelector(DiscordSelectors.Textarea.textArea.value);
								const editor = BdApi.getInternalInstance(textArea).return.stateNode.editorRef;

								editor.moveToRangeOfDocument();
								editor.delete();
								editor.insertText(output);

								const press = new KeyboardEvent("keydown", { key: "Enter", code: "Enter", which: 13, keyCode: 13, bubbles: true });
								Object.defineProperties(press, { keyCode: { value: 13 }, which: { value: 13 } });
								window.setTimeout(() => textArea.children[0].dispatchEvent(press), 100);

								document.querySelector(".apateEncryptionKey")?.classList.remove("calculating");
							}
						});

					}
					URL.revokeObjectURL(this.hideWorker);
				};

				async hideMessage(password) {
					const textArea = document.querySelector(DiscordSelectors.Textarea.textArea.value);
					let input = await (async () => {
						const textSegments = textArea?.querySelectorAll(`div > div > span[data-slate-object]`);
						let input = "";
						let newLine = false;

						for (let textSegment of textSegments) {
							switch (textSegment.getAttribute("data-slate-object")) {
								case ("text"): {
									if (newLine) {
										input += "\n";
									}
									input += textSegment.textContent;
									newLine = true;
									break;
								}
								case ("inline"): {
									newLine = false;

									if (textSegment.querySelector("img.emoji")) {
										const emojiName = textSegment.querySelector("img.emoji")?.alt?.replace(/:/g, "");

										let emojiText = `:${emojiName}:`;

										if (input.includes("*")) {
											let emojiId = textSegment.querySelector("img").src.match(/emojis\/(?<id>\d+\.(png|gif))/)?.groups["id"];

											if (emojiId === undefined) { // emojiId is undefined when it's a discord default emoji
												emojiText = `[${emojiName}:default]`;
											} else {
												emojiText = `[${emojiName}:${emojiId}]`;
											}
										}


										if (!emojiText) return;

										input += emojiText;
									} else if (textSegment.querySelector("span.mention")) {
										input += textSegment.textContent;
									}
									break;
								}
							}
						}

						return input;
					})();

					if (!input) return;


					let RegExpGroups = (
						(/^(?<coverMessage>([^\*]*))\*(?<hiddenMessage>([^\*]+))\*(?<invalidEndString>(.*))$/)
							.exec(input.trim())?.groups
					);

					let coverMessage = RegExpGroups?.coverMessage?.trim();
					let hiddenMessage = RegExpGroups?.hiddenMessage?.trim();
					let invalidEndString = RegExpGroups?.invalidEndString?.trim();

					const editor = BdApi.getInternalInstance(textArea).return.stateNode.editorRef;

					if (!coverMessage && !this.settings.devMode) {
						BdApi.alert("Invalid input!", "The Cover message must have at least one non-whitespace character (This is to prevent spam). Synatax: `cover message *hidden message*`");
						return;
					}

					//in case the user sends a one word cover message
					if (!/\S +\S/g.test.coverMessage) {
						coverMessage += " \u200b";
					}
					if (!hiddenMessage) {
						BdApi.alert("Invalid input!", "Something went wrong... Mark your hidden message with stars `*` like this: `cover message *hidden message*`!");
						return;
					}
					if (invalidEndString) {
						BdApi.alert("Invalid input!", "There can't be a string after the hidden message! Syntax: `cover message *hidden message*`");
						if (this.settings.deleteInvalid) {
							editor.moveToRangeOfDocument();
							editor.delete();
							editor.insertText(`${coverMessage}*${hiddenMessage}*`);
						}
						return;
					}


					editor.moveToRangeOfDocument();
					editor.delete();
					let pswd = ""
					if (typeof password !== "undefined" || password === "") {
						pswd = password;
					}
					else {
						if (this.settings.encryption === 1) {
							pswd = this.getPassword();
							coverMessage = pswd + coverMessage;
						}
						else {
							pswd = this.settings.password;
						}
						this.settings.saveCurrentPassword = true;
						this.saveSettings(this.settings);
					}
					hiddenMessage = hiddenMessage.replace(/\r?\n/g, "\\n") //replace new line with actual \n
					hiddenMessage += "\u200b"; //used as a verification if the password was correct 

					document.querySelector(".apateEncryptionKey")?.classList.add("calculating");

					this.hideWorker?.postMessage({
						id: `apate-hide-${Date.now().toString(36)}`,
						hide: true,
						hiddenMsg: hiddenMessage,
						coverMsg: coverMessage,
						password: pswd
					});
				}
				getPassword() {
					//makes a 4 character Long password that gets added to the start of the cover Text for some encryption
					let password = "";
					let invisibleCharacters = ["\u200C", "\u200D", "\u2061", "\u2062", "\u2063", "\u2064"];
					for (var i = 0; i < 4; i++) {
						password += invisibleCharacters[(Math.floor(Math.random() * 6))];
					}
					return password;
				}
				displayPasswordChoose() {
					var ul = document.createElement("ul");

					var noEncrypt = document.createElement("li");
					noEncrypt.setAttribute('id', "");
					noEncrypt.classList.add("passwordLi");
					noEncrypt.textContent = "-No Encryption-";
					noEncrypt.setAttribute('style', `color:SlateGray;`);

					if (this.settings.encryption === 1) {
						noEncrypt.classList.add("selectedPassword");
					}
					noEncrypt.addEventListener("click", (e) => {
						ul.querySelector(".selectedPassword").classList.remove("selectedPassword");
						e.target.classList.add("selectedPassword");
					})

					ul.appendChild(noEncrypt)
					for (var i = 0; i < this.settings.passwords.length; i++) {
						let item = this.settings.passwords[i]
						var li = document.createElement("li");
						li.setAttribute('id', item);

						li.classList.add("passwordLi")
						li.textContent = item;

						let color = this.settings.passwordColorTable[this.settings.passwords.indexOf(item)]
						if (i === 0) {
							li.setAttribute('style', `color:SlateGray;`);
							if (this.settings.encryption === 0) {
								li.classList.add("selectedPassword");
							}
						} else {
							li.setAttribute('style', `color:${color}`);
						}
						li.addEventListener("click", (e) => {
							ul.querySelector(".selectedPassword").classList.remove("selectedPassword");
							e.target.classList.add("selectedPassword");
						})
						ul.appendChild(li);
					}

					BdApi.showConfirmationModal("Choose password:", BdApi.React.createElement(HTMLWrapper, null, ul), {
						confirmText: "Send",
						cancelText: "Cancel",
						onConfirm: () => {
							let password = ul.querySelector(".selectedPassword").id;
							this.hideMessage(password)
						}
					});
				}

				displayPasswordChooseConfirm() {
					if (this.settings.showChoosePasswordConfirm) {
						let checkbox = document.createElement("input");
						checkbox.setAttribute("type", "checkbox");
						checkbox.setAttribute("id", "apateDontShowAgain");
						checkbox.setAttribute("title", "Don't show again.");

						let info = document.createElement("div");
						info.textContent = "The password you choose will only be used on this message."
						info.className = "markdown-11q6EU paragraph-3Ejjt0";

						let infoCheckBox = document.createElement("div");
						infoCheckBox.textContent = "Don't show this message again:"
						infoCheckBox.className = "markdown-11q6EU paragraph-3Ejjt0";
						infoCheckBox.appendChild(checkbox)

						let htmlText = document.createElement("div")
						htmlText.appendChild(info);
						htmlText.appendChild(document.createElement("br"))
						htmlText.appendChild(infoCheckBox)

						BdApi.showConfirmationModal("Send message with different encryption?", BdApi.React.createElement(HTMLWrapper, null, htmlText), {
							confirmText: "Choose password",
							cancelText: "Cancel",
							onConfirm: () => {
								if (document.getElementById("apateDontShowAgain").checked === true) {
									this.settings.showChoosePasswordConfirm = false;
									this.saveSettings(this.settings);
								}
								this.displayPasswordChoose();
							},

						});
					} else {
						this.displayPasswordChoose();
					}
				}

				patchTextArea() {
					const ChannelTextAreaContainer = BdApi.findModule(m => m.type?.render?.displayName === "ChannelTextAreaContainer");

					const Tooltip = BdApi.findModuleByProps('TooltipContainer').TooltipContainer;
					const ButtonContainerClasses = BdApi.findModule(m => m.buttonContainer && m.buttons);
					const ButtonWrapperClasses = BdApi.findModule(m => m.buttonWrapper && m.buttonContent);
					const ButtonClasses = BdApi.findModule(m => m.button && m.contents);

					const ApateKeyButton = BdApi.React.createElement(Tooltip, { text: "Right click to send with different Encryption!",
																			className: `apateKeyButtonContainer ${ButtonContainerClasses.buttonContainer} keyButton` },
							BdApi.React.createElement("button", { "aria-label": "Send Message",
																	tabindex: 0,
																	type: "button",
																	className: `apateEncryptionKeyButton ${ButtonWrapperClasses.buttonWrapper} ${ButtonClasses.button} ${ButtonClasses.lookBlank} ${ButtonClasses.colorBrand} ${ButtonClasses.grow}`,
																	onClick: (e) => {
																		if(this.settings.shiftNoEncryption && e.shiftKey) {
																			this.hideMessage("");
																		}
																		else {
																			this.hideMessage();
																		}
																	},
																	onContextMenu: (e) => {
																		e.preventDefault();
																		this.displayPasswordChooseConfirm();
																		return false;
																	}
																}, 
								BdApi.React.createElement("div", { className: `apateEncryptionKeyContainer ${ButtonClasses.contents} ${ButtonWrapperClasses.button} ${ButtonContainerClasses.button}`},
									BdApi.React.createElement("svg", { viewBox:"0 0 24 24", fill:"currentColor", className: `apateEncryptionKey ${ButtonWrapperClasses.icon}` }, [
											BdApi.React.createElement("path", {d: "M0 0h24v24H0z", fill: "none"}),
											BdApi.React.createElement("path", {d: "M11.9,11.2a.6.6,0,0,1-.6-.5,4.5,4.5,0,1,0-4.4,5.6A4.6,4.6,0,0,0,11,13.8a.7.7,0,0,1,.6-.4h2.2l.5.2,1,1.1.8-1c.2-.2.3-.3.5-.3l.5.2,1.2,1.1,1.2-1.1.5-.2h1l.9-1.1L21,11.2Zm-5,2.4a1.8,1.8,0,1,1,1.8-1.8A1.8,1.8,0,0,1,6.9,13.6Z"})
										]
									)
								)
							)
						);

					BdApi.Patcher.after("Apate", ChannelTextAreaContainer.type, "render", (_, [props], ret) => {
						if (this.settings.keyPosition === 2) {
							return
						}

						if (props.type === "edit") {
							if (!props.textValue.length || props.textValue[0] !== "\u200b") {
								return
							}

							// TODO
							return
						} else {
							const textArea = ret.props.children.find(c => c?.props?.className?.includes("channelTextArea-"));
							const textAreaContainer = textArea.props.children.find(c => c?.props?.className?.includes("scrollableContainer-"));
							const textAreaInner = textAreaContainer.props.children.find(c => c?.props?.className?.includes("inner-"));
							const buttons = textAreaInner.props.children.find(c => c?.props?.className?.includes("buttons-"));

							switch (this.settings.keyPosition) {
								case 0: // RIGHT
									buttons.props.children = [
										...buttons.props.children,
										ApateKeyButton
									]
									break;
								case 1: // LEFT
									textAreaInner.props.children.splice(textAreaInner.props.children.indexOf(textArea) - 1, 0, ApateKeyButton);
									break;
							}

							let form = textArea.ref.current?.parents().find(p => p.tagName === "FORM");

							if (this.settings.ctrlToSend && form && !form.classList.contains("hasApateListener")) {
								form.classList.add("hasApateListener");

								form.addEventListener("keyup", (evt) => {
									if (this.settings.shiftNoEncryption && evt.key === "Enter" && evt.ctrlKey && evt.shiftKey) {
										evt.preventDefault();
										this.hideMessage("");
									} else if(this.settings.altChoosePassword && evt.key === "Enter" && evt.ctrlKey && evt.altKey) {
										evt.preventDefault();
										this.displayPasswordChooseConfirm();
									}
									else if (evt.key === "Enter" && evt.ctrlKey) {
										evt.preventDefault();
										this.hideMessage();
									}
								});
							}
						}
					});
				}

				patchMessages() {
					const MessageContent = BdApi.findModule(m => m.type?.displayName === "MessageContent");

					BdApi.Patcher.after("Apate", MessageContent, "type", (_, [props], ret) => {
						if (props.className && (props.className.includes("repliedTextContent-") || props.className.includes("threadMessageAccessoryContent-"))) {
							return
						}

						if (props.message.content.length > 0 && props.message.content[0] === "\u200b") {
							ret.props.children = [
								...ret.props.children,
								BdApi.React.createElement(ApateMessage, { message: props.message, apate: this })
							]
						}
					});
				}

				patchAboutMe() {
					const UserPopout = BdApi.findModule(m => m.default.displayName === "UserPopoutBody");
					const UserInfoBase = BdApi.findModule(m => m.default.displayName === "UserInfoBase");
					const AccountUpdateModule = BdApi.findModuleByProps('setPendingBio');
					const BIO_MAX_LENGTH = BdApi.findModuleByProps("BIO_MAX_LENGTH").BIO_MAX_LENGTH;
					const aboutMeCache = {};

					function hashCode(s) {
						for (var i = 0, h = 0; i < s.length; i++)
							h = Math.imul(31, h) + s.charCodeAt(i) | 0;
						return h;
					}

					function getBioHiddenMessage(bio) {
						if (bio.charAt(0) === "\u200B") {
							let bioHash = hashCode(bio);

							if (aboutMeCache[bioHash] == undefined) {
								const stegCloak = new StegCloak();
								let hiddenMessage = stegCloak.reveal(bio.substring(1), "").trim();

								aboutMeCache[hashCode(bio)] = hiddenMessage;
							}

							return aboutMeCache[bioHash];
						}

						return null;
					}

					BdApi.Patcher.after("Apate", UserPopout, "default", (_, [props], ret) => {
						let hiddenMessage = getBioHiddenMessage(props.user.bio);

						if (hiddenMessage != null) {
							ret.props.children = [
								BdApi.React.createElement("div", { class: "apateAboutMeHidden apateHiddenMessage" }, hiddenMessage),
								...ret.props.children
							];
						}
					});

					BdApi.Patcher.after("Apate", UserInfoBase, "default", (_, [props], ret) => {
						let infoSection = ret.props.children.find(child => child.props?.className.includes("userInfoSection-"));
						let aboutMe = infoSection.props.children.find(child => child.props?.children?.some(subChild => subChild.props?.className.includes("userBio-")));

						let hiddenMessage = getBioHiddenMessage(props.user.bio);

						if (hiddenMessage != null) {
							aboutMe.props.children = [
								...aboutMe.props.children,
								BdApi.React.createElement("div", { class: "apateAboutMeHidden apateHiddenMessage" }, hiddenMessage),
							];
						}
					});

					BdApi.Patcher.before("Apate", AccountUpdateModule, "saveAccountChanges", (_, [patch], request) => {
						if (!typeof (patch.bio) === "string" || patch.bio.trim().length === 0 || this.settings.hiddenAboutMeText === "") {
							return
						}

						const stegCloak = new StegCloak();

						let oldBio = patch.bio.replace(/[\u200C\u200D\u2061\u2062\u2063\u2064\u200B]*/g, "");

						if (!oldBio.trim().includes(" ")) {
							BdApi.alert("Cover message only one word.", "Please use at least two words in your About Me cover message for Apate to work.");
							return
						}

						let newBio = "\u200B" + stegCloak.hide(this.settings.hiddenAboutMeText, "", oldBio);

						if (newBio.length > BIO_MAX_LENGTH) {
							BdApi.alert("About Me too long!", "Either shorten the text in the About Me page, or your hidden message, for Apate to work.");
						} else {
							Logger.log(`Changed bio, Cover message: ${newBio}, Hidden Message: ${this.settings.hiddenAboutMeText}.`);
							patch.bio = newBio;
						}
					});
				}

				onStop() {
					for (const worker of this.revealWorkers) {
						worker.terminate();
					}
					BdApi.clearCSS("apateCSS");
					BdApi.Patcher.unpatchAll("Apate");
				};
			};
		};
		return plugin(Plugin, Api);
	})(global.ZeresPluginLibrary.buildPlugin(config));
})();
