import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { ContextMenuComponent } from './context-menu/context-menu.component';
import { WorkspaceRoutingModule } from './workspace-routing.module';
import { WorkspaceComponent } from './workspace.component';
import { PropsComponent } from './props/props.component';
import { TopologyService } from './topology.service';


@NgModule({
  imports: [SharedModule, WorkspaceRoutingModule],
  declarations: [WorkspaceComponent, PropsComponent, ContextMenuComponent],
  providers: [TopologyService]
})
export class WorkspaceModule { }
