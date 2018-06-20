import { Component, Input } from '@angular/core';
import { InventoryComponent } from './inventory.component';

@Component({
    selector: 'g2-inventory-menu',
    templateUrl: './inventory-menu.component.html',
    styleUrls: ['./inventory-menu.component.less']
})
export class InventoryMenuComponent {

    @Input() contents: InventoryComponent;

    openDataManagementDialog(): void {
        this.contents.openDataManagementDialog();
    }
}
