import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth/auth.service';

interface MenuItem {
  id: number;
  icon: string;
  label: string;
  link: string;
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit {
  selectedMenuItem: number = 1;
  menuItems: MenuItem[] = [
    { id: 1, icon: 'fas fa-home', label: 'Home', link: '/home' },
    { id: 2, icon: 'far fa-comment', label: 'My Tweets', link: '/my-tweets' },
    { id: 3, icon: 'fas fa-hashtag', label: 'Explore Users', link: '/explore-users'},
    { id: 4, icon: 'fas fa-users', label: 'Following', link: '/following' },
    { id: 5, icon: 'fas fa-sign-out-alt', label: 'Logout', link: '/logout' },
  ];

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    const currentMenu = '/' + window.location.href.split('/').pop();
    const selectedMenuItem = this.menuItems.find(
      (item) => currentMenu == item.link
    );
    if (selectedMenuItem) {
      this.selectedMenuItem = selectedMenuItem.id;
    }
  }

  navigateTo(menuItem: MenuItem): void {
    if (menuItem.id === 5) {
      this.authService.logout();
    } else {
      this.selectedMenuItem = menuItem.id;
      this.router.navigate([`home${menuItem.link}`]);
    }
  }
}
