/**
 * @name OldMediaButtons
 * @author KingGamingYT
 * @description Restores Discord's "hyperlink" button style in the media viewer used until late 2024.
 * @version 1.1.0
 */

const { Data, Webpack, React, Patcher, DOM, UI } = BdApi;
const mediaViewer = Webpack.getModule(m => String(m.type).includes(".mediaArea"))
let actionButtons = Webpack.getByStrings('hideMediaOptions');

const buttonCSS = 
    `
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
    constructor(meta) {
        this.controller = new AbortController();
    }

    start() {
        this.addStyles();
        Patcher.after('OldMediaButtons', mediaViewer, "type", (that, [props, context], res) => {
            if (!actionButtons) {
                actionButtons = BdApi.Webpack.getByStrings('hideMediaOptions');
            } 
            res.props.children = [res.props.children, React.createElement("div", {className: "omb-anchorContainer",
                style: { display: "flex", position: "relative", lineHeight: "30px", zIndex: "9999"},
                children: React.createElement(actionButtons, { item: props.items[0]})})
            ]
        });
    }
    stop() {
        Patcher.unpatchAll('OldMediaButtons');
        DOM.removeStyle('buttonCSS', buttonCSS);
    }

    async addStyles() {
        const classesMediaArea = await Webpack.waitForModule(Webpack.Filters.byKeys('mediaArea'))
        const classesTopBar = await Webpack.waitForModule(Webpack.Filters.byKeys('topBar'))
        const classesCarouselModal = await Webpack.waitForModule(Webpack.Filters.byKeys('carouselModal'))
        const classesActionButtons = await Webpack.waitForModule(Webpack.Filters.byKeys('actionButton', 'actionButtonWrapper'))
    
        const styles = Object.assign({},
            classesMediaArea,
            classesTopBar,
            classesCarouselModal,
            classesActionButtons
        )
    
        if (this.controller.signal.aborted) return;
    
        DOM.addStyle('buttonCSS', webpackify(buttonCSS, styles));
    }
}