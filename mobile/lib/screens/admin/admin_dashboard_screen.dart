import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../controllers/auth_controller.dart';
import '../../controllers/library_controller.dart';
import 'manage_posts_screen.dart';
import 'post_form_screen.dart';

class AdminDashboardScreen extends StatefulWidget {
  const AdminDashboardScreen({super.key});

  @override
  State<AdminDashboardScreen> createState() => _AdminDashboardScreenState();
}

class _AdminDashboardScreenState extends State<AdminDashboardScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<LibraryController>().fetchPosts(force: true);
    });
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthController>();
    final library = context.watch<LibraryController>();
    final posts = library.posts;
    final pdfCount = posts.where((p) => p.hasPdf).length;
    final audioCount = posts.where((p) => p.hasAudio).length;

    return Scaffold(
      appBar: AppBar(
        title: Text('Admin • ${auth.user?.username ?? ''}'),
        actions: [
          IconButton(
            onPressed: () => context.read<AuthController>().logout(),
            icon: const Icon(Icons.logout_rounded),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: library.refresh,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            Row(
              children: [
                Expanded(
                  child: _StatCard(
                    title: 'Posts',
                    value: '${posts.length}',
                    icon: Icons.library_books_outlined,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _StatCard(
                    title: 'PDF Files',
                    value: '$pdfCount',
                    icon: Icons.picture_as_pdf_outlined,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: _StatCard(
                    title: 'Audio Files',
                    value: '$audioCount',
                    icon: Icons.headphones_rounded,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: FilledButton.icon(
                    onPressed: () async {
                      await Navigator.of(context).push(
                        MaterialPageRoute<void>(
                          builder: (_) => const PostFormScreen(),
                        ),
                      );
                      if (!context.mounted) return;
                      context.read<LibraryController>().refresh();
                    },
                    icon: const Icon(Icons.add_rounded),
                    label: const Text('New post'),
                    style: FilledButton.styleFrom(
                      minimumSize: const Size.fromHeight(118),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(24),
                      ),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),
            OutlinedButton.icon(
              onPressed: () async {
                await Navigator.of(context).push(
                  MaterialPageRoute<void>(
                    builder: (_) => const ManagePostsScreen(),
                  ),
                );
                if (!context.mounted) return;
                context.read<LibraryController>().refresh();
              },
              icon: const Icon(Icons.settings_outlined),
              label: const Text('Manage posts'),
            ),
            const SizedBox(height: 20),
            Text(
              'Recent uploads',
              style: Theme.of(context)
                  .textTheme
                  .titleLarge
                  ?.copyWith(fontWeight: FontWeight.w700),
            ),
            const SizedBox(height: 12),
            ...posts.take(5).map(
                  (post) => Card(
                    child: ListTile(
                      title: Text(post.title),
                      subtitle: Text(post.author),
                      trailing: const Icon(Icons.chevron_right_rounded),
                    ),
                  ),
                ),
          ],
        ),
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  const _StatCard({
    required this.title,
    required this.value,
    required this.icon,
  });

  final String title;
  final String value;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: SizedBox(
        height: 118,
        child: Padding(
          padding: const EdgeInsets.all(18),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Icon(icon),
              Text(
                value,
                style: Theme.of(context).textTheme.headlineMedium,
              ),
              Text(title),
            ],
          ),
        ),
      ),
    );
  }
}
