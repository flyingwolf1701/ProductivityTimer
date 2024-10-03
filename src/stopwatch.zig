const std = @import("std");

const Stopwatch = struct {
    start_time: i64,
    total_elapsed_time: i64,
    lap_start_time: i64,
    is_running: bool,
    laps: std.ArrayList(i64),

    fn init(allocator: std.mem.Allocator) Stopwatch {
        return Stopwatch{
            .start_time = 0,
            .total_elapsed_time = 0,
            .lap_start_time = 0,
            .is_running = false,
            .laps = std.ArrayList(i64).init(allocator),
        };
    }

    fn start(self: *Stopwatch) void {
        if (!self.is_running) {
            const now = std.time.milliTimestamp();
            self.start_time = now;
            self.lap_start_time = now;
            self.is_running = true;
        }
    }

    fn stop(self: *Stopwatch) void {
        if (self.is_running) {
            const now = std.time.milliTimestamp();
            self.total_elapsed_time += now - self.start_time;
            self.is_running = false;
        }
    }

    fn reset(self: *Stopwatch) void {
        self.start_time = 0;
        self.total_elapsed_time = 0;
        self.lap_start_time = 0;
        self.is_running = false;
        self.laps.clearRetainingCapacity();
    }

    fn lap(self: *Stopwatch) !void {
        const now = std.time.milliTimestamp();
        const lap_time = now - self.lap_start_time;
        try self.laps.append(lap_time);
        self.lap_start_time = now;
    }

    fn getTotalTime(self: *Stopwatch) i64 {
        if (self.is_running) {
            return self.total_elapsed_time + (std.time.milliTimestamp() - self.start_time);
        } else {
            return self.total_elapsed_time;
        }
    }

    fn getCurrentLapTime(self: *Stopwatch) i64 {
        if (self.is_running) {
            return std.time.milliTimestamp() - self.lap_start_time;
        } else {
            return 0;
        }
    }

    fn getLapCount(self: *Stopwatch) usize {
        return self.laps.items.len;
    }

    fn getLapTime(self: *Stopwatch, index: usize) i64 {
        if (index < self.laps.items.len) {
            return self.laps.items[index];
        } else {
            return 0;
        }
    }
};

// Global instance of Stopwatch
var gpa = std.heap.GeneralPurposeAllocator(.{}){};
var stopwatch: Stopwatch = undefined;

// WebAssembly export functions
export fn init() void {
    stopwatch = Stopwatch.init(gpa.allocator());
}

export fn start() void {
    stopwatch.start();
}

export fn stop() void {
    stopwatch.stop();
}

export fn reset() void {
    stopwatch.reset();
}

export fn lap() void {
    stopwatch.lap() catch {};
}

export fn getTotalTime() i64 {
    return stopwatch.getTotalTime();
}

export fn getCurrentLapTime() i64 {
    return stopwatch.getCurrentLapTime();
}

export fn getLapCount() usize {
    return stopwatch.getLapCount();
}

export fn getLapTime(index: usize) i64 {
    return stopwatch.getLapTime(index);
}

// Helper function to format time (returns a pointer to a static buffer)
var time_buffer: [9:0]u8 = undefined;
export fn formatTime(milliseconds: i64) [*:0]const u8 {
    const total_seconds = @divFloor(milliseconds, 1000);
    const hours = @divFloor(total_seconds, 3600);
    const minutes = @divFloor(@mod(total_seconds, 3600), 60);
    const seconds = @mod(total_seconds, 60);

    _ = std.fmt.bufPrintZ(&time_buffer, "{d:0>2}:{d:0>2}:{d:0>2}", .{ hours, minutes, seconds }) catch unreachable;
    return &time_buffer;
}
