import 'dart:io';

import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../models/post_model.dart';
import '../../services/auth_service.dart';
import '../../services/post_service.dart';

class PostFormScreen extends StatefulWidget {
  const PostFormScreen({super.key, this.post});

  final PostModel? post;

  @override
  State<PostFormScreen> createState() => _PostFormScreenState();
}

class _PostFormScreenState extends State<PostFormScreen> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _titleController;
  late final TextEditingController _authorController;
  late final TextEditingController _contentController;

  File? _image;
  File? _pdf;
  File? _audio;
  bool _submitting = false;

  bool get isEdit => widget.post != null;

  @override
  void initState() {
    super.initState();
    _titleController = TextEditingController(text: widget.post?.title ?? '');
    _authorController = TextEditingController(text: widget.post?.author ?? '');
    _contentController =
        TextEditingController(text: widget.post?.content ?? '');
  }

  @override
  void dispose() {
    _titleController.dispose();
    _authorController.dispose();
    _contentController.dispose();
    super.dispose();
  }

  Future<void> _pickFile(String type) async {
    final result = await FilePicker.platform.pickFiles(
      type: switch (type) {
        'image' => FileType.image,
        'pdf' => FileType.custom,
        _ => FileType.audio,
      },
      allowedExtensions: type == 'pdf' ? ['pdf'] : null,
    );

    if (result == null || result.files.single.path == null) return;
    final file = File(result.files.single.path!);
    setState(() {
      if (type == 'image') _image = file;
      if (type == 'pdf') _pdf = file;
      if (type == 'audio') _audio = file;
    });
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _submitting = true);

    try {
      final service = context.read<PostService>();
      if (isEdit) {
        await service.updatePost(
          id: widget.post!.id,
          title: _titleController.text.trim(),
          author: _authorController.text.trim(),
          content: _contentController.text.trim(),
          image: _image,
          pdf: _pdf,
          audio: _audio,
        );
      } else {
        await service.createPost(
          title: _titleController.text.trim(),
          author: _authorController.text.trim(),
          content: _contentController.text.trim(),
          image: _image,
          pdf: _pdf,
          audio: _audio,
        );
      }

      if (!mounted) return;
      Navigator.of(context).pop();
    } catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(AuthService.extractMessage(error))),
      );
    } finally {
      if (mounted) {
        setState(() => _submitting = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(isEdit ? 'Edit post' : 'Create post'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            children: [
              TextFormField(
                controller: _titleController,
                decoration: const InputDecoration(labelText: 'Title'),
                validator: (value) =>
                    value == null || value.isEmpty ? 'Title is required' : null,
              ),
              const SizedBox(height: 14),
              TextFormField(
                controller: _authorController,
                decoration: const InputDecoration(labelText: 'Author'),
                validator: (value) =>
                    value == null || value.isEmpty ? 'Author is required' : null,
              ),
              const SizedBox(height: 14),
              TextFormField(
                controller: _contentController,
                maxLines: 8,
                decoration: const InputDecoration(labelText: 'Content'),
                validator: (value) => value == null || value.isEmpty
                    ? 'Content is required'
                    : null,
              ),
              const SizedBox(height: 18),
              _PickerTile(
                label: _image?.path.split(Platform.pathSeparator).last ??
                    widget.post?.image ??
                    'Choose image',
                icon: Icons.image_outlined,
                onTap: () => _pickFile('image'),
              ),
              const SizedBox(height: 10),
              _PickerTile(
                label: _pdf?.path.split(Platform.pathSeparator).last ??
                    widget.post?.pdf ??
                    'Choose PDF',
                icon: Icons.picture_as_pdf_outlined,
                onTap: () => _pickFile('pdf'),
              ),
              const SizedBox(height: 10),
              _PickerTile(
                label: _audio?.path.split(Platform.pathSeparator).last ??
                    widget.post?.audio ??
                    'Choose audio',
                icon: Icons.headphones_outlined,
                onTap: () => _pickFile('audio'),
              ),
              const SizedBox(height: 24),
              FilledButton(
                onPressed: _submitting ? null : _submit,
                style: FilledButton.styleFrom(
                  minimumSize: const Size.fromHeight(52),
                ),
                child: _submitting
                    ? const SizedBox(
                        height: 22,
                        width: 22,
                        child: CircularProgressIndicator(
                          strokeWidth: 2.4,
                          color: Colors.white,
                        ),
                      )
                    : Text(isEdit ? 'Save changes' : 'Create post'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _PickerTile extends StatelessWidget {
  const _PickerTile({
    required this.label,
    required this.icon,
    required this.onTap,
  });

  final String label;
  final IconData icon;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: ListTile(
        leading: Icon(icon),
        title: Text(
          label,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
        ),
        trailing: const Icon(Icons.attach_file_rounded),
        onTap: onTap,
      ),
    );
  }
}
