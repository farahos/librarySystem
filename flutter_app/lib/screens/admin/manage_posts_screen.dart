import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../controllers/library_controller.dart';
import '../../services/auth_service.dart';
import '../../services/post_service.dart';
import 'post_form_screen.dart';

class ManagePostsScreen extends StatefulWidget {
  const ManagePostsScreen({super.key});

  @override
  State<ManagePostsScreen> createState() => _ManagePostsScreenState();
}

class _ManagePostsScreenState extends State<ManagePostsScreen> {
  bool _busy = false;

  Future<void> _deletePost(String id) async {
    final confirm = await showDialog<bool>(
          context: context,
          builder: (_) => AlertDialog(
            title: const Text('Delete post'),
            content: const Text('Are you sure you want to delete this post?'),
            actions: [
              TextButton(
                onPressed: () => Navigator.of(context).pop(false),
                child: const Text('Cancel'),
              ),
              FilledButton(
                onPressed: () => Navigator.of(context).pop(true),
                child: const Text('Delete'),
              ),
            ],
          ),
        ) ??
        false;

    if (!confirm) return;

    setState(() => _busy = true);
    try {
      await context.read<PostService>().deletePost(id);
      if (!mounted) return;
      await context.read<LibraryController>().refresh();
    } catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(AuthService.extractMessage(error))),
      );
    } finally {
      if (mounted) {
        setState(() => _busy = false);
      }
    }
  }

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<LibraryController>().fetchPosts(force: true);
    });
  }

  @override
  Widget build(BuildContext context) {
    final library = context.watch<LibraryController>();

    return Scaffold(
      appBar: AppBar(title: const Text('Manage posts')),
      body: Stack(
        children: [
          RefreshIndicator(
            onRefresh: library.refresh,
            child: ListView(
              padding: const EdgeInsets.all(16),
              children: [
                ...library.posts.map(
                  (post) => Card(
                    child: ListTile(
                      title: Text(post.title),
                      subtitle: Text(post.author),
                      trailing: Wrap(
                        spacing: 6,
                        children: [
                          IconButton(
                            onPressed: () async {
                              await Navigator.of(context).push(
                                MaterialPageRoute<void>(
                                  builder: (_) => PostFormScreen(post: post),
                                ),
                              );
                              if (!context.mounted) return;
                              context.read<LibraryController>().refresh();
                            },
                            icon: const Icon(Icons.edit_outlined),
                          ),
                          IconButton(
                            onPressed: () => _deletePost(post.id),
                            icon: const Icon(Icons.delete_outline_rounded),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
          if (_busy)
            Container(
              color: Colors.black26,
              child: const Center(child: CircularProgressIndicator()),
            ),
        ],
      ),
    );
  }
}
