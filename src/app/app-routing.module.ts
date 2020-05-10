import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';

import { HomeComponent } from './home/home.component';

const routes: Routes = [
  { path: '', component: HomeComponent, pathMatch: 'full' },
  { path: 'search', loadChildren: () => import('./search/search.module').then(m => m.SearchModule) },
  { path: 'workspace', loadChildren: () => import('./workspace/workspace.module').then(m => m.WorkspaceModule) },
  { path: 'view', loadChildren: () => import('./view/view.module').then(m => m.ViewModule) },
  { path: 'user', loadChildren: () => import('./user/user.module').then(m => m.UserModule) },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
