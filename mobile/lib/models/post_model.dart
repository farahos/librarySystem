import 'user_model.dart';

class PostModel {
  const PostModel({
    required this.id,
    required this.title,
    required this.author,
    required this.content,
    required this.createdAt,
    this.image,
    this.pdf,
    this.audio,
    this.uploadedBy,
  });

  final String id;
  final String title;
  final String author;
  final String content;
  final String? image;
  final String? pdf;
  final String? audio;
  final DateTime? createdAt;
  final UserModel? uploadedBy;

  bool get hasImage => image != null && image!.isNotEmpty;
  bool get hasPdf => pdf != null && pdf!.isNotEmpty;
  bool get hasAudio => audio != null && audio!.isNotEmpty;

  factory PostModel.fromJson(Map<String, dynamic> json) {
    return PostModel(
      id: (json['_id'] ?? '').toString(),
      title: (json['title'] ?? '').toString(),
      author: (json['author'] ?? '').toString(),
      content: (json['content'] ?? '').toString(),
      image: json['image']?.toString(),
      pdf: json['pdf']?.toString(),
      audio: json['audio']?.toString(),
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt'].toString())
          : null,
      uploadedBy: json['uploadedBy'] is Map<String, dynamic>
          ? UserModel.fromJson(json['uploadedBy'] as Map<String, dynamic>)
          : null,
    );
  }
}
