import { Component } from '@angular/core';
import { CharacterComponent } from './character.component';

@Component({
    selector: 'g2-character-menu',
    templateUrl: './character-menu.component.html',
    styleUrls: ['./character-menu.component.less']
})
export class CharacterMenuComponent {

    contents: CharacterComponent;

    constructor() { }

    getUpdated(): boolean {
        return (this.contents) ? this.contents.updated : false;
    }

}
