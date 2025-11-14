import 'package:flutter/material.dart';
import 'package:news_app/news_home_page.dart';
import 'package:news_app/pages/categories_page.dart';
import 'package:news_app/pages/podcasts_page.dart';
import 'package:news_app/pages/bookmarks_page.dart';
import 'package:news_app/pages/videos_page.dart';
import 'package:news_app/pages/subscription_plans_new.dart';

class MainNavigationPage extends StatefulWidget {
  const MainNavigationPage({super.key});

  @override
  State<MainNavigationPage> createState() => _MainNavigationPageState();
}

class _MainNavigationPageState extends State<MainNavigationPage> {
  int _currentIndex = 0;

  final List<Widget> _pages = [
    const NewsHomePage(),
    const CategoriesPage(),
    const PodcastsPage(),
    const BookmarksPage(),
    // const VideosPage(),
    const SubscriptionPlansPage(),
  ];

  final List<NavigationItem> _navigationItems = [
    NavigationItem(
      icon: Icons.home_outlined,
      activeIcon: Icons.home,
      label: 'Home',
    ),
    NavigationItem(
      icon: Icons.category_outlined,
      activeIcon: Icons.category,
      label: 'Categorias',
    ),
    NavigationItem(
      icon: Icons.podcasts_outlined,
      activeIcon: Icons.podcasts,
      label: 'Podcasts',
    ),
    NavigationItem(
      icon: Icons.bookmark_outline,
      activeIcon: Icons.bookmark,
      label: 'Bookmarks',
    ),
    NavigationItem(
      icon: Icons.workspace_premium_outlined,
      activeIcon: Icons.workspace_premium,
      label: 'Premium',
    ),
  ];

 @override
Widget build(BuildContext context) {
  return Scaffold(
    body: IndexedStack(
      index: _currentIndex,
      children: _pages,
    ),
    bottomNavigationBar: Container(
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 10,
            offset: const Offset(0, -5),
          ),
        ],
      ),
      child: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 8), // Reduzido de 8 para 4
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly, // Mudado para spaceEvenly
            children: _navigationItems.asMap().entries.map((entry) {
              int index = entry.key;
              NavigationItem item = entry.value;
              bool isActive = index == _currentIndex;

              return Expanded( // Adicionado Expanded para distribuir igualmente
                child: GestureDetector(
                  onTap: () {
                    setState(() {
                      _currentIndex = index;
                    });
                  },
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    padding: const EdgeInsets.symmetric(
                      horizontal: 4, // Reduzido de 12 para 4
                      vertical: 6,   // Reduzido de 8 para 6
                    ),
                    decoration: BoxDecoration(
                      color: isActive 
                          ? const Color(0xFFC7A87B).withOpacity(0.1)
                          : Colors.transparent,
                      borderRadius: BorderRadius.circular(8), // Reduzido de 12 para 8
                    ),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          isActive ? item.activeIcon : item.icon,
                          color: isActive 
                              ? const Color(0xFFC7A87B)
                              : const Color(0xFF333333).withOpacity(0.6),
                          size: 22, // Reduzido de 24 para 22
                        ),
                        const SizedBox(height: 2), // Reduzido de 4 para 2
                        Text(
                          item.label,
                          style: TextStyle(
                            fontSize: 9, // Reduzido de 11 para 9
                            fontWeight: isActive 
                                ? FontWeight.w600 
                                : FontWeight.normal,
                            color: isActive 
                                ? const Color(0xFFC7A87B)
                                : const Color(0xFF333333).withOpacity(0.6),
                          ),
                          textAlign: TextAlign.center,
                        ),
                      ],
                    ),
                  ),
                ),
              );
            }).toList(),
          ),
        ),
      ),
    ),
  );
}
}

class NavigationItem {
  final IconData icon;
  final IconData activeIcon;
  final String label;

  NavigationItem({
    required this.icon,
    required this.activeIcon,
    required this.label,
  });
}