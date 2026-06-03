import 'package:audioplayers/audioplayers.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';

import '../controllers/app_settings_controller.dart';
import '../controllers/library_controller.dart';
import '../models/post_model.dart';

class PostDetailScreen extends StatefulWidget {
  const PostDetailScreen({super.key, required this.postId});

  final String postId;

  @override
  State<PostDetailScreen> createState() => _PostDetailScreenState();
}

class _PostDetailScreenState extends State<PostDetailScreen> {
  final AudioPlayer _audioPlayer = AudioPlayer();
  bool _playing = false;

  @override
  void dispose() {
    _audioPlayer.dispose();
    super.dispose();
  }

  Future<void> _toggleAudio(String url) async {
    if (_playing) {
      await _audioPlayer.pause();
      setState(() => _playing = false);
      return;
    }

    await _audioPlayer.play(UrlSource(url));
    setState(() => _playing = true);
  }

  Future<void> _openUrl(String url) async {
    final uri = Uri.parse(url);
    if (!await launchUrl(uri, mode: LaunchMode.externalApplication)) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Could not open link')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<PostModel>(
      future: context.read<LibraryController>().getPostById(widget.postId),
      builder: (_, snapshot) {
        return Scaffold(
          appBar: AppBar(title: const Text('Post details')),
          body: Builder(
            builder: (_) {
              if (snapshot.connectionState == ConnectionState.waiting) {
                return const Center(child: CircularProgressIndicator());
              }

              if (snapshot.hasError || !snapshot.hasData) {
                return const Center(child: Text('Failed to load post'));
              }

              final post = snapshot.data!;
              final autoPlay = context.watch<AppSettingsController>().autoplayAudio;

              if (post.hasAudio && autoPlay && !_playing) {
                WidgetsBinding.instance.addPostFrameCallback((_) {
                  if (mounted && !_playing) {
                    _toggleAudio(post.audio!);
                  }
                });
              }

              return ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  if (post.hasImage)
                    ClipRRect(
                      borderRadius: BorderRadius.circular(28),
                      child: Image.network(
                        post.image!,
                        height: 240,
                        fit: BoxFit.cover,
                      ),
                    ),
                  const SizedBox(height: 18),
                  Text(
                    post.title,
                    style: Theme.of(context)
                        .textTheme
                        .headlineMedium
                        ?.copyWith(fontWeight: FontWeight.w700),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'By ${post.uploadedBy?.username ?? post.author}'
                    '${post.createdAt != null ? ' • ${DateFormat.yMMMd().format(post.createdAt!)}' : ''}',
                  ),
                  const SizedBox(height: 18),
                  Text(
                    post.content,
                    style: Theme.of(context).textTheme.bodyLarge,
                  ),
                  const SizedBox(height: 22),
                  if (post.hasPdf)
                    Card(
                      child: ListTile(
                        leading: const Icon(Icons.picture_as_pdf_outlined),
                        title: const Text('Open PDF'),
                        subtitle: const Text('View the attached document'),
                        trailing: const Icon(Icons.open_in_new_rounded),
                        onTap: () => _openUrl(post.pdf!),
                      ),
                    ),
                  if (post.hasAudio)
                    Card(
                      child: ListTile(
                        leading: const Icon(Icons.audiotrack_rounded),
                        title: Text(_playing ? 'Pause audio' : 'Play audio'),
                        subtitle: const Text('Listen to the audio attachment'),
                        trailing: Icon(
                          _playing
                              ? Icons.pause_circle_filled_rounded
                              : Icons.play_circle_fill_rounded,
                        ),
                        onTap: () => _toggleAudio(post.audio!),
                      ),
                    ),
                ],
              );
            },
          ),
        );
      },
    );
  }
}
