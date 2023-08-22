import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TwitterLoginComponent } from './twitter-login/twitter-login.component';
import { RegisterPageComponent } from './register-page/register-page.component';
import { SharedModule } from '../shared/shared.module';

const routes: Routes = [
  { path: 'login', component: TwitterLoginComponent },
  { path: 'register', component: RegisterPageComponent },
  { path: '**', redirectTo: 'login' },
];

@NgModule({
  declarations: [TwitterLoginComponent, RegisterPageComponent],
  imports: [CommonModule, RouterModule.forChild(routes), ReactiveFormsModule,FormsModule, SharedModule],
})
export class AuthModule {}
