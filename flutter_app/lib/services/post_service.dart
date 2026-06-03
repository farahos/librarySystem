import 'dart:io';

import 'package:dio/dio.dart';
import 'package:path/path.dart' as path;

import '../models/post_model.dart';
import 'api_client.dart';

class PostService {
  PostService(this._apiClient);

  final ApiClient _apiClient;

  Future<List<PostModel>> getPosts() async {
    final response = await _apiClient.dio.get<List<dynamic>>('/post/getPosts');
    final data = response.data ?? <dynamic>[];
    return data
        .whereType<Map<String, dynamic>>()
        .map(PostModel.fromJson)
        .toList();
  }

  Future<PostModel> getPostById(String id) async {
    final response =
        await _apiClient.dio.get<Map<String, dynamic>>('/post/getPost/$id');
    return PostModel.fromJson(response.data ?? <String, dynamic>{});
  }

  Future<void> createPost({
    required String title,
    required String author,
    required String content,
    File? image,
    File? pdf,
    File? audio,
  }) async {
    final formData = await _buildFormData(
      title: title,
      author: author,
      content: content,
      image: image,
      pdf: pdf,
      audio: audio,
    );

    await _apiClient.dio.post('/post/createPost', data: formData);
  }

  Future<void> updatePost({
    required String id,
    required String title,
    required String author,
    required String content,
    File? image,
    File? pdf,
    File? audio,
  }) async {
    final formData = await _buildFormData(
      title: title,
      author: author,
      content: content,
      image: image,
      pdf: pdf,
      audio: audio,
    );

    await _apiClient.dio.put('/post/$id', data: formData);
  }

  Future<void> deletePost(String id) async {
    await _apiClient.dio.delete('/post/$id');
  }

  Future<FormData> _buildFormData({
    required String title,
    required String author,
    required String content,
    File? image,
    File? pdf,
    File? audio,
  }) async {
    final map = <String, dynamic>{
      'title': title,
      'author': author,
      'content': content,
    };

    if (image != null) {
      map['image'] = await MultipartFile.fromFile(
        image.path,
        filename: path.basename(image.path),
      );
    }
    if (pdf != null) {
      map['pdf'] = await MultipartFile.fromFile(
        pdf.path,
        filename: path.basename(pdf.path),
      );
    }
    if (audio != null) {
      map['audio'] = await MultipartFile.fromFile(
        audio.path,
        filename: path.basename(audio.path),
      );
    }

    return FormData.fromMap(map);
  }
}
