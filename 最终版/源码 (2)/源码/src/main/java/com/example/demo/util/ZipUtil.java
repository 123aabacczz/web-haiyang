package com.example.demo.util;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

public class ZipUtil {
    public static void pack(File sourceDir, File zipFile) throws IOException {
        try (ZipOutputStream zos = new ZipOutputStream(new FileOutputStream(zipFile))) {
            addDirectoryToZip(sourceDir, sourceDir, zos);
        }
    }

    private static void addDirectoryToZip(File rootDir, File sourceDir, ZipOutputStream zos) throws IOException {
        for (File file : sourceDir.listFiles()) {
            if (file.isDirectory()) {
                addDirectoryToZip(rootDir, file, zos);
            } else {
                ZipEntry entry = new ZipEntry(getRelativePath(rootDir, file));
                zos.putNextEntry(entry);
                Files.copy(file.toPath(), zos);
                zos.closeEntry();
            }
        }
    }

    private static String getRelativePath(File rootDir, File file) {
        return rootDir.toPath().relativize(file.toPath()).toString();
    }
}
