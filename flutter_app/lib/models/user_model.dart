class UserModel {
  const UserModel({
    required this.id,
    required this.username,
    required this.email,
    required this.role,
    required this.phone,
    required this.bio,
  });

  final String id;
  final String username;
  final String email;
  final String role;
  final String phone;
  final String bio;

  bool get isAdmin => role == 'admin';

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: (json['_id'] ?? json['id'] ?? '').toString(),
      username: (json['username'] ?? '').toString(),
      email: (json['email'] ?? '').toString(),
      role: (json['role'] ?? 'user').toString(),
      phone: (json['phone'] ?? '').toString(),
      bio: (json['bio'] ?? '').toString(),
    );
  }

  Map<String, dynamic> toJson() => {
        '_id': id,
        'username': username,
        'email': email,
        'role': role,
        'phone': phone,
        'bio': bio,
      };
}
