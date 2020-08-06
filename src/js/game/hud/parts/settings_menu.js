import { BaseHUDPart } from "../base_hud_part";
import { makeDiv, formatBigNumberFull } from "../../../core/utils";
import { DynamicDomAttach } from "../dynamic_dom_attach";
import { InputReceiver } from "../../../core/input_receiver";
import { KeyActionMapper, KEYMAPPINGS } from "../../key_action_mapper";
import { T } from "../../../translations";
import { StaticMapEntityComponent } from "../../components/static_map_entity";
import { BeltComponent } from "../../components/belt";

export class HUDSettingsMenu extends BaseHUDPart {
    createElements(parent) {
        this.background = makeDiv(parent, "ingame_HUD_SettingsMenu", ["ingameDialog"]);

        this.menuElement = makeDiv(this.background, null, ["menuElement"]);

        this.statsElement = makeDiv(
            this.background,
            null,
            ["statsElement"],
            `
            <strong>${T.ingame.settingsMenu.beltsPlaced}</strong><span class="beltsPlaced"></span>
            <strong>${T.ingame.settingsMenu.buildingsPlaced}</strong><span class="buildingsPlaced"></span>
            <strong>${T.ingame.settingsMenu.playtime}</strong><span class="playtime"></span>

            `
        );

        this.buttonContainer = makeDiv(this.menuElement, null, ["buttons"]);

        const buttons = [
            {
                title: T.ingame.settingsMenu.buttons.continue,
                action: () => this.close(),
            },
            {
                title: T.ingame.settingsMenu.buttons.settings,
                action: () => this.goToSettings(),
            },
            {
                title: T.ingame.settingsMenu.buttons.menu,
                action: () => this.returnToMenu(),
            },
        ];

        for (let i = 0; i < buttons.length; ++i) {
            const { title, action } = buttons[i];

            const element = document.createElement("button");
            element.classList.add("styledButton");
            element.innerText = title;
            this.buttonContainer.appendChild(element);

            this.trackClicks(element, action);
        }
    }

    returnToMenu() {
        this.root.gameState.goBackToMenu();
    }

    goToSettings() {
        this.root.gameState.goToSettings();
    }

    shouldPauseGame() {
        return this.visible;
    }

    shouldPauseRendering() {
        return this.visible;
    }

    initialize() {
        this.root.keyMapper.getBinding(KEYMAPPINGS.general.back).add(this.show, this);

        this.domAttach = new DynamicDomAttach(this.root, this.background, {
            attachClass: "visible",
        });

        this.inputReciever = new InputReceiver("settingsmenu");
        this.keyActionMapper = new KeyActionMapper(this.root, this.inputReciever);
        this.keyActionMapper.getBinding(KEYMAPPINGS.general.back).add(this.close, this);

        this.close();
    }

    cleanup() {
        document.body.classList.remove("ingameDialogOpen");
    }

    show() {
        this.visible = true;
        document.body.classList.add("ingameDialogOpen");
        this.root.app.inputMgr.makeSureAttachedAndOnTop(this.inputReciever);

        const totalMinutesPlayed = Math.ceil(this.root.time.now() / 60);

        /** @type {HTMLElement} */
        const playtimeElement = this.statsElement.querySelector(".playtime");
        /** @type {HTMLElement} */
        const buildingsPlacedElement = this.statsElement.querySelector(".buildingsPlaced");
        /** @type {HTMLElement} */
        const beltsPlacedElement = this.statsElement.querySelector(".beltsPlaced");

        playtimeElement.innerText = T.global.time.xMinutes.replace("<x>", `${totalMinutesPlayed}`);

        buildingsPlacedElement.innerText = formatBigNumberFull(
            this.root.entityMgr.getAllWithComponent(StaticMapEntityComponent).length -
                this.root.entityMgr.getAllWithComponent(BeltComponent).length
        );

        beltsPlacedElement.innerText = formatBigNumberFull(
            this.root.entityMgr.getAllWithComponent(BeltComponent).length
        );
    }

    close() {
        this.visible = false;
        document.body.classList.remove("ingameDialogOpen");
        this.root.app.inputMgr.makeSureDetached(this.inputReciever);
        this.update();
    }

    update() {
        this.domAttach.update(this.visible);
    }
}
