import 'dart:async';
import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_database/firebase_database.dart';
import 'package:google_fonts/google_fonts.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(
    options: const FirebaseOptions(
      apiKey: "AIzaSyCIWF8oPhWTtGRor36hwadCVLq0FqGVpfY",
      authDomain: "pjweather-987bf.firebaseapp.com",
      databaseURL: "https://pjweather-987bf-default-rtdb.europe-west1.firebasedatabase.app",
      projectId: "pjweather-987bf",
      storageBucket: "pjweather-987bf.firebasestorage.app",
      messagingSenderId: "1073777041889",
      appId: "1:1073777041889:web:214966b692627d860672a0",
    ),
  );
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: const Color(0xFF0D0F11), // خلفية داكنة جداً وفخمة
      ),
      home: const WeatherDashboard(),
    );
  }
}

class WeatherDashboard extends StatefulWidget {
  const WeatherDashboard({super.key});
  @override
  State<WeatherDashboard> createState() => _WeatherDashboardState();
}

class _WeatherDashboardState extends State<WeatherDashboard> {
  // الألوان المتناسقة (Color Palette)
  final Color cardBg = const Color(0xFF181B1F); 
  final Color primaryAccent = const Color(0xFF4C9AFF); // أزرق هادئ
  final Color secondaryText = const Color(0xFF70757A); // رمادي للنصوص الفرعية

  final DatabaseReference liveRef = FirebaseDatabase.instance.ref("Live_Weather");
  final DatabaseReference deviceRef = FirebaseDatabase.instance.ref("device");

  double temp = 0, hum = 0, press = 0;
  String date = "", time = "", status = "OFFLINE";

  @override
  void initState() {
    super.initState();
    _setupFirebaseListeners();
  }

  void _setupFirebaseListeners() {
    liveRef.onValue.listen((event) {
      final data = event.snapshot.value as Map?;
      if (data != null) {
        setState(() {
          temp = (data['Temperature'] ?? 0).toDouble();
          hum = (data['Humidity'] ?? 0).toDouble();
          press = (data['Pressure'] ?? 0).toDouble();
          date = data['Date'] ?? "";
          time = data['Time'] ?? "";
        });
      }
    });

    deviceRef.onValue.listen((event) {
      final data = event.snapshot.value as Map?;
      if (data != null) {
        final lastTime = data['last_seen_time'] ?? "";
        final lastDate = data['last_seen_date'] ?? "";
        if (lastTime.isNotEmpty) {
          final parts = lastDate.split('-');
          final lastSeen = DateTime.tryParse("${parts[2]}-${parts[1]}-${parts[0]} $lastTime");
          if (lastSeen != null) {
            setState(() => status = DateTime.now().difference(lastSeen).inSeconds > 12 ? "OFFLINE" : "ONLINE");
          }
        }
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 20),
              _buildTopBar(),
              const SizedBox(height: 30),
              _buildMainHeroCard(),
              const SizedBox(height: 35),
              Text("TODAY'S HIGHLIGHTS", 
                style: GoogleFonts.outfit(fontSize: 13, fontWeight: FontWeight.bold, color: secondaryText, letterSpacing: 1.5)),
              const SizedBox(height: 15),
              Expanded(child: _buildHighlightsGrid()),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTopBar() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text("Current Location", style: GoogleFonts.outfit(color: secondaryText, fontSize: 12)),
          Text("Basrah, Iraq", style: GoogleFonts.outfit(fontSize: 18, fontWeight: FontWeight.bold)),
        ]),
        _statusIndicator(),
      ],
    );
  }

  Widget _statusIndicator() {
    bool isOnline = status == "ONLINE";
    return Container(
      padding: const EdgeInsets.all(8),
      decoration: BoxDecoration(color: cardBg, borderRadius: BorderRadius.circular(12)),
      child: Row(children: [
        CircleAvatar(radius: 4, backgroundColor: isOnline ? Colors.greenAccent : Colors.redAccent),
        const SizedBox(width: 8),
        Text(status, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold)),
      ]),
    );
  }

  Widget _buildMainHeroCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(35),
      decoration: BoxDecoration(
        color: cardBg,
        borderRadius: BorderRadius.circular(32),
        border: Border.all(color: Colors.white.withOpacity(0.05)),
      ),
      child: Column(children: [
        Icon(Icons.cloud_queue_rounded, size: 60, color: primaryAccent),
        const SizedBox(height: 15),
        Text("${temp.toStringAsFixed(1)}°", style: GoogleFonts.outfit(fontSize: 90, fontWeight: FontWeight.w200)),
        Text(time, style: GoogleFonts.outfit(color: secondaryText, fontSize: 14)),
      ]),
    );
  }

  Widget _buildHighlightsGrid() {
    return GridView.count(
      crossAxisCount: 2,
      crossAxisSpacing: 16,
      mainAxisSpacing: 16,
      childAspectRatio: 1.0,
      children: [
        _dataTile("Humidity", "${hum.toInt()}%", Icons.water_drop_outlined, Colors.blue),
        _dataTile("Pressure", "${press.toInt()}", Icons.speed_outlined, Colors.purpleAccent),
        _dataTile("Visibility", "03 km", Icons.visibility_outlined, Colors.tealAccent),
        _dataTile("Feels Like", "${(temp + 1).toInt()}°", Icons.thermostat_outlined, Colors.orangeAccent),
      ],
    );
  }

  Widget _dataTile(String label, String val, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(color: cardBg, borderRadius: BorderRadius.circular(24)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Icon(icon, color: color.withOpacity(0.7), size: 22),
          Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(val, style: GoogleFonts.outfit(fontSize: 22, fontWeight: FontWeight.bold)),
            Text(label, style: GoogleFonts.outfit(color: secondaryText, fontSize: 11)),
          ]),
        ],
      ),
    );
  }
}