/**
 * @name OldMediaButtons
 * @author KingGamingYT
 * @description Restores Discord's "hyperlink" button style in the media viewer used until late 2024.
 * @version 1.1.1
 */

const { Data, Webpack, React, Patcher, DOM, UI } = BdApi;
const mediaViewer = Webpack.getModule(m => String(m.type).includes(".mediaArea"))
let actionButtons = Webpack.getByStrings('hideMediaOptions');

const buttonCSS = `
    .carouselModal .topBar {
        display: none;
    }
    .carouselModal {
        .authorAvatar, .author, .closeButton {
            display: none;
        }
        .omb-anchorContainer .topBar {
            display: flex;
            .actionButtons {
                background-color: transparent;
                border: unset;
                gap: unset;
                text-wrap: nowrap;
                margin-left: -25px;
                .actionButton {
                    visibility: hidden;
                    width: auto;
                    color: #fff;
                    opacity: .5;
                    transition: opacity .15s ease;
                }
                .actionButton:hover {
                    opacity: 1;
                    text-decoration: underline;
                }
                .actionButton:after {
                    content: attr(aria-label);
                    visibility: visible;
                }
                .actionButton:has(svg[name="ZOOM"]):after {
                    content: "Zoom Settings";
                    visibility: visible;
                }
            }
        }
    }
`;

function webpackify(css, styles) {
    for (const key in styles) {
        let regex = new RegExp(`\\.${key}([\\s,.):>])`, 'g');
        css = css.replace(regex, `.${styles[key]}$1`);
    }
    return css;
}

module.exports = class OldMediaButtons {
    constructor(meta) {}

    start() {
		console.log("STARTING")
		this.controller = new AbortController();
        window.stylepromise = this.addStyles();
        Patcher.after('OldMediaButtons', mediaViewer, "type", (that, [props, context], res) => {
            if (!actionButtons) {
                actionButtons = BdApi.Webpack.getByStrings('hideMediaOptions');
            }
           Patcher.after('OldMediaButtons', res.props, "children", (that, subprops, res) => {
            console.log() 
            res.props.children = [res.props.children, React.createElement("div", {className: "omb-anchorContainer",
                style: { display: "flex", position: "relative", lineHeight: "30px", zIndex: "9999"},
                children: React.createElement(actionButtons, { item: props.items[0]})})
            ]
           } )
           
        });
    }
    stop() {
		this.controller.abort();
        Patcher.unpatchAll('OldMediaButtons');
        DOM.removeStyle('buttonCSS', buttonCSS);
    }
	
	async addStyles() {
		console.log("add styles")
		
		console.log("classesMediaArea");
		const classesMediaArea = await Webpack.waitForModule((e, m) => Webpack.Filters.byKeys('mediaArea')(m.exports))
		
		console.log("classesTopBar");
		const classesTopBar = await Webpack.waitForModule((e, m) => Webpack.Filters.byKeys('topBar')(m.exports))
		
		console.log("classesCarouselModal");
		const classesCarouselModal = await Webpack.waitForModule((e, m) => Webpack.Filters.byKeys('carouselModal')(m.exports))
		
		console.log("classesActionButtons");
		const classesActionButtons = await Webpack.waitForModule((e, m) => Webpack.Filters.byKeys('actionButton', 'actionButtonWrapper')(m.exports))
		
		// This means stop() was called before the promises were resolved
		if (this.controller.signal.aborted) return;

		const styles = Object.assign({},
			classesMediaArea,
			classesTopBar,
			classesCarouselModal,
			classesActionButtons
		);
		
		console.log(styles);
		console.log(webpackify(buttonCSS, styles));
		
		DOM.addStyle('buttonCSS', webpackify(buttonCSS, styles));
	}
}