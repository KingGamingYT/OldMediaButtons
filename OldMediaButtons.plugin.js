/**
 * @name OldMediaButtons
 * @author KingGamingYT
 * @description Restores Discord's "hyperlink" button style in the media viewer used until late 2024.
 * @version 1.0.0
 */

const { Data, Webpack, React, Patcher, DOM, UI } = BdApi;
const mediaViewer = Webpack.getModule(m => String(m.type).includes(".mediaArea"))
let actionButtons = Webpack.getByStrings('hideMediaOptions');

const styles = Object.assign({},
    Webpack.getByKeys('mediaArea'),
    Webpack.getByKeys('topBar'),
    Webpack.getByKeys('carouselModal'),
    Webpack.getByKeys('actionButton', 'actionButtonWrapper')
)
const buttonCSS = webpackify(
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
    `
)
function webpackify(css) {
    for (const key in styles) {
        let regex = new RegExp(`\\.${key}([\\s,.):>])`, 'g');
        css = css.replace(regex, `.${styles[key]}$1`);
    }
    return css;
}

module.exports = class OldMediaButtons {
    constructor(meta) {}

    start() {
        DOM.addStyle('buttonCSS', buttonCSS)
        Patcher.after('OldMediaButtons', mediaViewer, "type", (that, [props, context], res) => {
            if (!actionButtons) {
                actionButtons = BdApi.Webpack.getByStrings('hideMediaOptions');
            } 
            res.props.children = [res.props.children, React.createElement("div", {className: "omb-anchorContainer",
                style: { display: "block", position: "relative", lineHeight: "30px", zIndex: "9999"},
                children: React.createElement(actionButtons, { item: props.items[0]})})
            ]
        });
    }
    stop() {
        Patcher.unpatchAll('OldMediaButtons');
        DOM.removeStyle('buttonCSS', buttonCSS);
    }
}